import { supabase } from '@/lib/supabase.js';

export const DatePlan = {
  async create(data) {
    const { data: result, error } = await supabase
      .from('date_plans')
      .insert([data])
      .select()
      .single();
    if (error) throw error;
    return result;
  },

  async filter(filters = {}, orderBy = '-created_at', limit = 100) {
    let query = supabase.from('date_plans').select('*');
    
    Object.entries(filters).forEach(([key, value]) => {
      query = query.eq(key, value);
    });

    const isDesc = orderBy.startsWith('-');
    const column = isDesc ? orderBy.slice(1) : orderBy;
    query = query.order(column, { ascending: !isDesc });

    if (limit) query = query.limit(limit);

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  async get(id) {
    const { data, error } = await supabase
      .from('date_plans')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  },

  async update(id, updates) {
    const { data, error } = await supabase
      .from('date_plans')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async delete(id) {
    const { error } = await supabase
      .from('date_plans')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return true;
  }
};