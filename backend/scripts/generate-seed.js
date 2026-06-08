import bcrypt from 'bcryptjs';

const password = 'password123';
const hash = await bcrypt.hash(password, 10);

console.log('Password hash for seed data:');
console.log(hash);
console.log('\nUse this hash in supabase/schema.sql for all seed users.');
console.log('\nDemo credentials:');
console.log('Super Admin: SA001 / password123');
console.log('Admin: AD001 / password123');
console.log('Student: ST001 / password123');
