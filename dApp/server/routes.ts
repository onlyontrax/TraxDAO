// import Routes from 'next-routes';
const routes = require('next-routes');

/**
 * routes.add([name], pattern = /name, page = name)
   routes.add(object)
 */

export default routes()
  .add('dashboard', '/', '/')
  .add('contact', '/contact', '/contact')
  .add('video', '/video', '/video')
  .add('store', '/store', '/store')
  .add('gallery', '/gallery', '/gallery')
  .add('page', '/page', '/page')
  .add('feed', '/post', '/post')
  .add('message', '/messages', '/messages')
  .add('cart', '/cart', '/cart')
  .add('error', '/error', '/error')
  //.add('home', '/home', '/home')
  .add('search', '/search', '/search')
  .add('wallet', '/wallet', '/wallet')
  .add('payment-success', '/payment/success', '/payment/success')
  .add('payment-cancel', '/payment/cancel', '/payment/cancel')
  //.add('login', '/login', '/?login=true')
  .add('login', '/login', '/login')
  .add('register', '/register', '/register')
  // performer
  .add('artists', '/artist', '/artist')
  .add('user-stream', '/streaming', '/streaming')
  .add('list-stream', '/streaming/details', '/streaming/details')
  // must be in the last
  .add('artist', '/artist/profile', '/artist/profile');
