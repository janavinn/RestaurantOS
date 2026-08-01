import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany();
  for (const user of users) {
    if (user.pin && !user.pin.startsWith('$2b$')) {
      const hashedPin = await bcrypt.hash(user.pin, 10);
      await prisma.user.update({
        where: { id: user.id },
        data: { pin: hashedPin }
      });
    }
  }
  console.log('Fixed pins successfully!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
