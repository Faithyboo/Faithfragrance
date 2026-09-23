import { Product, StockLog, SaleRecord } from '../types';

export const BRAND_LOGO_URL = 'https://lh3.googleusercontent.com/aida/AEtjO1V8iE1hJYVFPE4bspNmFnEinTbTqBYd7zoVNeExXFfv_FkjWLFrIpfvOfaF3zlIJVjSMYkHyxWZ-N6dzsbKgZqLG4ZIjOyGkk3dbe7622l3TMltZajmx9woePCphFRilhYFsq3txovwftgMWWTTU_2-6BKFWxcz_WRoMzLY0jSj0AW68ADgFct-Xg9WVh_oC3h9LL5HDWnnd6AsJ5DIk8tmUzZZu7rh1jcJtmkBV_Is9bhlm8JB-I102htL';

export const INITIAL_CATEGORIES = [
  'All',
  'Perfumes',
  'Body Mists',
  'Lip Care',
  'Sanitizers',
  'Car & Home Scents'
];

// Empty by user request: ready for owner to add their products
export const INITIAL_PRODUCTS: Product[] = [];

export const INITIAL_STOCK_LOGS: StockLog[] = [];

export const INITIAL_SALES: SaleRecord[] = [];
