import { node } from '@/db/node';
import { project } from '@/db/project';
import { sshRelations, sshKey } from '@/db/ssh_key';
import { user, userRelations } from '@/db/user';
import { vm, vmRelations } from '@/db/vm';
import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';

export const db = drizzle(process.env.DATABASE_URL!, {
  schema: {user, project, vm, node, sshKey, sshRelations, userRelations, vmRelations}
});