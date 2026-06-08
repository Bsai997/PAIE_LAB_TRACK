import bcrypt from 'bcryptjs';
import { supabase } from '../config/supabase.js';
import dotenv from 'dotenv';

dotenv.config();

const users = [
  { regdid: 'SA001', name: 'Super Admin', role: 'super_admin', department: 'CSE', branch: 'Main', clubmail: 'sa001@paiecell.com', originalmail: 'superadmin@example.com' },
  { regdid: 'AD001', name: 'Admin User', role: 'admin', department: 'CSE', branch: 'Main', clubmail: 'ad001@paiecell.com', originalmail: 'admin@example.com' },
  { regdid: 'ST001', name: 'John Student', role: 'student', department: 'CSE', branch: 'A', clubmail: 'st001@paiecell.com', originalmail: 'john@example.com' },
  { regdid: 'ST002', name: 'Jane Doe', role: 'student', department: 'ECE', branch: 'B', clubmail: 'st002@paiecell.com', originalmail: 'jane@example.com' },
];

async function seed() {
  const password = 'password123';
  const password_hash = await bcrypt.hash(password, 10);
  console.log('Hash:', password_hash);

  for (const u of users) {
    const { data: existing } = await supabase.from('users').select('id').eq('regdid', u.regdid).maybeSingle();
    if (existing) {
      console.log(`Skip ${u.regdid} (exists)`);
      continue;
    }

    const { error } = await supabase.from('users').insert({
      ...u,
      password_hash,
      profile_photo: `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}&background=6366f1&color=fff`,
    });

    if (error) console.error(`Failed ${u.regdid}:`, error.message);
    else console.log(`Created ${u.regdid}`);
  }

  console.log('\nDemo login: SA001 / AD001 / ST001 with password password123');
}

seed().catch(console.error);
