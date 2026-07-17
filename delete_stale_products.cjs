const { PrismaClient } = require('./src/generated/prisma/client');
const p = new PrismaClient();
(async () => {
  const products = await p.product.findMany({
    where: { productImages: { some: { imagePath: { contains: 'uploads/temp' } } } },
    include: { productImages: true }
  });
  console.log('Stale products to delete:', products.map(x => ({ id: x.id, name: x.name, slug: x.slug, images: x.productImages.map(i => i.imagePath) })));
  
  if (products.length > 0) {
    for (const prod of products) {
      await p.productImage.deleteMany({ where: { productId: prod.id } });
      await p.product.delete({ where: { id: prod.id } });
      console.log('Deleted product:', prod.name);
    }
  }
  
  console.log('Done. Deleted', products.length, 'stale products.');
  await p.$disconnect();
})();
