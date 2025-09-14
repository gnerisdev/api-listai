import prisma from '#prisma';

async function main() {
  const existingSettings = await prisma.settings.findFirst();

  if (!existingSettings) {
    await prisma.settings.create({
      data: {
        percentage_gift: 15,
        color: '#1d314c',
      }
    });

    console.log('Default settings.');
  }
}

main()
  .catch((e) => {
    console.error('Erro ao executar o seed:', e);
    process.exit(1);
  })
  .finally(async () => await prisma.$disconnect());
