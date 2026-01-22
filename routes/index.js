import AddressRoute from './AddressRoute.js';
import AuthRoute from './AuthRoute.js';
import BrandRoute from './BrandRoute.js';
import CartRoute from './CartRoute.js';
import CategoryRoute from './CategoryRoute.js';
import CouponRoute from './CouponRoute.js';
import OrderRoute from './OrderRoute.js';
import ProductRoute from './ProductRoute.js';
import ReviewRoute from './ReviewRoute.js';
import SubCategoryRoute from './SubCategoryRoute.js';
import UserRoute from './UserRoute.js';
import WishlistRoute from './WishlistRoute.js';

const mountRoutes = app => {
  app.use ('/api/v1/categories', CategoryRoute);
  app.use ('/api/v1/subcategories', SubCategoryRoute);
  app.use ('/api/v1/brands', BrandRoute);
  app.use ('/api/v1/products', ProductRoute);
  app.use ('/api/v1/users', UserRoute);
  app.use ('/api/v1/auth', AuthRoute);
  app.use ('/api/v1/reviews', ReviewRoute);
  app.use ('/api/v1/wishlist', WishlistRoute);
  app.use ('/api/v1/addresses', AddressRoute);
  app.use ('/api/v1/coupons', CouponRoute);
  app.use ('/api/v1/cart', CartRoute);
  app.use ('/api/v1/orders', OrderRoute);
};
export default mountRoutes;
