export const METHODCATEGORY = [
  {
    titleCategory: 'Dinheiro',
    methods: [{ id: 'dinheiro', title: 'Dinehiro', parent: 'Dinehiro' }],
  },
  {
    titleCategory: 'Pix',
    methods: [{ id: 'pix', title: 'Pix', parent: 'Pix' }],
  },
  {
    titleCategory: 'Débito',
    methods: [
      { id: 'mastercard-debito', title: 'Mastercard', parent: 'Débito' },
      { id: 'visa-debito', title: 'Visa', parent: 'Débito' },
      { id: 'elo-debito', title: 'Elo', parent: 'Débito' },
      { id: 'hipercard-debito', title: 'Hipercard', parent: 'Débito' },
    ],
  },
  {
    titleCategory: 'Crédito',
    methods: [
      { id: 'hipercard-credito', title: 'Hipercard', parent: 'Crédito' },
      { id: 'visa-credito', title: 'Visa', parent: 'Crédito' },
      { id: 'nugo-credito', title: 'Nugo', parent: 'Crédito' },
      { id: 'mastercard-credito', title: 'Mastercard', parent: 'Crédito' },
      { id: 'elo-credito', title: 'Elo', parent: 'Crédito' },
      { id: 'amex-credito', title: 'Amex', parent: 'Crédito' },
    ],
  },
  {
    titleCategory: 'Vale-refeição',
    methods: [
      { id: 'vr-refeicao', title: 'VR Refeição', parent: 'Vale-refeição' },
      {
        id: 'sodexo-refeicao',
        title: 'Sodexo Refeição',
        parent: 'Vale-refeição',
      },
      { id: 'ticket-refeicao', title: 'Ticket', parent: 'Vale-refeição' },
    ],
  },
];

export const METHODS = [
  {
    id: 'dinheiro',
    title: 'Dinehiro',
    parent: 'Dinheiro',
    image: 'https://res.cloudinary.com/dzcmjryzc/image/upload/v1707799089/meuapetite/c5s9hxi0btgwkyldprvn.png',
  },

  {
    id: 'pix',
    title: 'Pix',
    parent: 'Pix',
    image: 'https://res.cloudinary.com/dzcmjryzc/image/upload/v1707799044/meuapetite/yalb2r2irlk5xool76rc.png',
  },

  {
    id: 'mastercard-debito',
    title: 'Mastercard',
    parent: 'Débito',
    image: 'https://res.cloudinary.com/dzcmjryzc/image/upload/v1707799089/meuapetite/ichhagyb92k2nkdnnvbi.webp',
  },

  {
    id: 'visa-debito',
    title: 'Visa',
    parent: 'Débito',
    image: 'https://res.cloudinary.com/dzcmjryzc/image/upload/v1707799088/meuapetite/vne3onveizfzl9qhbwue.webp'
  },

  {
    id: 'elo-debito',
    title: 'Elo',
    parent: 'Débito',
    image: 'https://res.cloudinary.com/dzcmjryzc/image/upload/v1707799088/meuapetite/ovmpqrfl7wrle5j2eujc.webp',
  },

  {
    id: 'hipercard-debito',
    title: 'Hipercard',
    parent: 'Débito',
    image: 'https://res.cloudinary.com/dzcmjryzc/image/upload/v1707799088/meuapetite/oioriesdm9ebglr50lmf.png'
  },

  {
    id: 'hipercard-credito',
    title: 'Hipercard',
    parent: 'Crédito',
    image: 'https://res.cloudinary.com/dzcmjryzc/image/upload/v1707799088/meuapetite/oioriesdm9ebglr50lmf.png',
  },

  {
    id: 'visa-credito',
    title: 'Visa',
    parent: 'Crédito',
    image: 'https://res.cloudinary.com/dzcmjryzc/image/upload/v1707799088/meuapetite/vne3onveizfzl9qhbwue.webp'
  },

  {
    id: 'nugo-credito',
    title: 'Nugo',
    parent: 'Crédito',
    image: 'https://res.cloudinary.com/dzcmjryzc/image/upload/v1707799088/meuapetite/dr1gbkdtfxjowmy7jedl.avif'
  },

  {
    id: 'mastercard-credito',
    title: 'Mastercard',
    parent: 'Crédito',
    image: 'https://res.cloudinary.com/dzcmjryzc/image/upload/v1707799089/meuapetite/ichhagyb92k2nkdnnvbi.webp',
  },

  {
    id: 'elo-credito',
    title: 'Elo',
    parent: 'Crédito',
    image: 'https://res.cloudinary.com/dzcmjryzc/image/upload/v1707799088/meuapetite/ovmpqrfl7wrle5j2eujc.webp',
  },

  {
    id: 'amex-credito',
    title: 'Amex',
    parent: 'Crédito',
    image: 'https://res.cloudinary.com/dzcmjryzc/image/upload/v1707799088/meuapetite/zgvrqyna7fwlsanbrvmk.png'
  },

  {
    id: 'vr-refeicao',
    title: 'VR Refeição',
    parent: 'Vale-refeição',
    image: 'https://res.cloudinary.com/dzcmjryzc/image/upload/v1707799088/meuapetite/dxenh3vetfqjm7tmodzi.avif'
  },

  {
    id: 'sodexo-refeicao',
    title: 'Sodexo Refeição',
    parent: 'Vale-refeição',
    image: 'https://res.cloudinary.com/dzcmjryzc/image/upload/v1707799088/meuapetite/awccleidh1xilpodjcsv.png'
  },

  {
    id: 'ticket-refeicao',
    title: 'Ticket',
    parent: 'Vale-refeição',
    image: 'https://res.cloudinary.com/dzcmjryzc/image/upload/v1707799087/meuapetite/yjet5uyf7nbnrwhnsz2a.png'
  },
];
