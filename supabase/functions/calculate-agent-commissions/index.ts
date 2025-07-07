import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface Agent {
  id: number;
  name: string;
  contact_person: string;
  email: string;
  phone?: string;
  location?: string;
  commission_rate: number;
  status: string;
  created_at: string;
  updated_at: string;
}

interface StudentWithFees {
  id: number;
  agent_id: number;
  total_paid: number;
  total_due: number;
}

interface AgentCommissionData extends Agent {
  students_count: number;
  total_received: number;
  commission_due: number;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    console.log('Starting agent commission calculation...');

    // Get all agents
    const { data: agents, error: agentsError } = await supabaseClient
      .from('agents')
      .select('*')
      .order('created_at', { ascending: false });

    if (agentsError) {
      console.error('Error fetching agents:', agentsError);
      throw agentsError;
    }

    console.log(`Found ${agents?.length || 0} agents`);

    const agentsWithCommissions: AgentCommissionData[] = [];

    for (const agent of agents || []) {
      console.log(`Processing agent: ${agent.name} (ID: ${agent.id})`);

      // Get students for this agent
      const { data: students, error: studentsError } = await supabaseClient
        .from('students')
        .select('id')
        .eq('agent_id', agent.id);

      if (studentsError) {
        console.error(`Error fetching students for agent ${agent.id}:`, studentsError);
        // Continue with next agent instead of failing completely
        agentsWithCommissions.push({
          ...agent,
          students_count: 0,
          total_received: 0,
          commission_due: 0
        });
        continue;
      }

      const studentIds = students?.map(s => s.id) || [];
      const studentsCount = studentIds.length;

      console.log(`Agent ${agent.name} has ${studentsCount} students`);

      if (studentsCount === 0) {
        agentsWithCommissions.push({
          ...agent,
          students_count: 0,
          total_received: 0,
          commission_due: 0
        });
        continue;
      }

      // Get fee collections (payments) for these students
      const { data: feeCollections, error: collectionsError } = await supabaseClient
        .from('fee_collections')
        .select('student_id, amount_paid')
        .in('student_id', studentIds);

      if (collectionsError) {
        console.error(`Error fetching fee collections for agent ${agent.id}:`, collectionsError);
      }

      // Get fee payments (due amounts) for these students
      const { data: feePayments, error: paymentsError } = await supabaseClient
        .from('fee_payments')
        .select('student_id, amount_due, amount_paid')
        .in('student_id', studentIds);

      if (paymentsError) {
        console.error(`Error fetching fee payments for agent ${agent.id}:`, paymentsError);
      }

      // Calculate totals
      let totalPaidAmount = 0;
      let totalDueAmount = 0;

      // Sum from fee_collections
      if (feeCollections) {
        totalPaidAmount += feeCollections.reduce((sum, payment) => sum + (payment.amount_paid || 0), 0);
      }

      // Sum from fee_payments
      if (feePayments) {
        totalPaidAmount += feePayments.reduce((sum, payment) => sum + (payment.amount_paid || 0), 0);
        totalDueAmount += feePayments.reduce((sum, payment) => {
          const due = (payment.amount_due || 0) - (payment.amount_paid || 0);
          return sum + Math.max(due, 0); // Only count positive due amounts
        }, 0);
      }

      // Calculate commissions
      const commissionRate = agent.commission_rate / 100; // Convert percentage to decimal
      const totalReceived = totalPaidAmount * commissionRate;
      const commissionDue = totalDueAmount * commissionRate;

      console.log(`Agent ${agent.name}: Paid=${totalPaidAmount}, Due=${totalDueAmount}, Commission Rate=${agent.commission_rate}%, Total Received=${totalReceived}, Commission Due=${commissionDue}`);

      agentsWithCommissions.push({
        ...agent,
        students_count: studentsCount,
        total_received: Number(totalReceived.toFixed(2)),
        commission_due: Number(commissionDue.toFixed(2))
      });
    }

    console.log('Agent commission calculation completed');

    return new Response(
      JSON.stringify(agentsWithCommissions),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Error in calculate-agent-commissions function:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error', 
        details: error.message 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})