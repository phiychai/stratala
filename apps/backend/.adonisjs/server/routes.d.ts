import '@adonisjs/core/types/http'

type ParamValue = string | number | bigint | boolean

export type ScannedRoutes = {
  ALL: {
    'user.get_by_username': { paramsTuple: [ParamValue]; params: {'username': ParamValue} }
    'auth.sign_in_email': { paramsTuple?: []; params?: {} }
    'auth.sign_up_email': { paramsTuple?: []; params?: {} }
    'auth.sign_out': { paramsTuple?: []; params?: {} }
    'auth.get_session': { paramsTuple?: []; params?: {} }
    'auth.catch_all': { paramsTuple: [...ParamValue[]]; params: {'*': ParamValue[]} }
    'user.me': { paramsTuple?: []; params?: {} }
    'user.update_profile': { paramsTuple?: []; params?: {} }
    'user.upload_avatar': { paramsTuple?: []; params?: {} }
    'user.index': { paramsTuple?: []; params?: {} }
    'user.toggle_status': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'cms_proxy.get_collection': { paramsTuple: [ParamValue]; params: {'collection': ParamValue} }
    'cms_proxy.get_item': { paramsTuple: [ParamValue,ParamValue]; params: {'collection': ParamValue,'id': ParamValue} }
    'cms_proxy.get': { paramsTuple: [...ParamValue[]]; params: {'*': ParamValue[]} }
    'cms_proxy.post': { paramsTuple: [...ParamValue[]]; params: {'*': ParamValue[]} }
    'cms_proxy.patch': { paramsTuple: [...ParamValue[]]; params: {'*': ParamValue[]} }
    'cms_proxy.delete': { paramsTuple: [...ParamValue[]]; params: {'*': ParamValue[]} }
    'auth_errors.index': { paramsTuple?: []; params?: {} }
    'auth_errors.stats': { paramsTuple?: []; params?: {} }
    'auth_errors': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'auth_errors.reconcile': { paramsTuple?: []; params?: {} }
    'admin.list_users': { paramsTuple?: []; params?: {} }
    'admin.create_user': { paramsTuple?: []; params?: {} }
    'admin.get_user': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.update_user': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.delete_user': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.toggle_status': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.sync_all_users': { paramsTuple?: []; params?: {} }
    'admin.sync_user': { paramsTuple?: []; params?: {} }
    'admin_sessions.list_user_sessions': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin_sessions.revoke_all_sessions': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin_sessions.revoke_session': { paramsTuple: [ParamValue]; params: {'sessionToken': ParamValue} }
    'billing.get_or_create_account': { paramsTuple?: []; params?: {} }
    'billing.get_subscriptions': { paramsTuple?: []; params?: {} }
    'billing.create_subscription': { paramsTuple?: []; params?: {} }
    'billing.cancel_subscription': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'billing.get_invoices': { paramsTuple?: []; params?: {} }
    'billing.get_payment_methods': { paramsTuple?: []; params?: {} }
    'billing.add_payment_method': { paramsTuple?: []; params?: {} }
    'billing.get_plans': { paramsTuple?: []; params?: {} }
    'feed.get_personalized_feed': { paramsTuple?: []; params?: {} }
    'feed.get_followed_spaces': { paramsTuple?: []; params?: {} }
    'feed.check_follow_status': { paramsTuple: [ParamValue]; params: {'spaceId': ParamValue} }
    'feed.follow_space': { paramsTuple: [ParamValue]; params: {'spaceId': ParamValue} }
    'feed.unfollow_space': { paramsTuple: [ParamValue]; params: {'spaceId': ParamValue} }
    'engagement.track_view': { paramsTuple: [ParamValue,ParamValue]; params: {'contentType': ParamValue,'contentId': ParamValue} }
    'engagement.like_content': { paramsTuple: [ParamValue,ParamValue]; params: {'contentType': ParamValue,'contentId': ParamValue} }
    'engagement.unlike_content': { paramsTuple: [ParamValue,ParamValue]; params: {'contentType': ParamValue,'contentId': ParamValue} }
    'engagement.get_like_status': { paramsTuple: [ParamValue,ParamValue]; params: {'contentType': ParamValue,'contentId': ParamValue} }
    'trending.get_trending': { paramsTuple?: []; params?: {} }
  }
  GET: {
    'user.get_by_username': { paramsTuple: [ParamValue]; params: {'username': ParamValue} }
    'auth.get_session': { paramsTuple?: []; params?: {} }
    'auth.catch_all': { paramsTuple: [...ParamValue[]]; params: {'*': ParamValue[]} }
    'user.me': { paramsTuple?: []; params?: {} }
    'user.index': { paramsTuple?: []; params?: {} }
    'cms_proxy.get_collection': { paramsTuple: [ParamValue]; params: {'collection': ParamValue} }
    'cms_proxy.get_item': { paramsTuple: [ParamValue,ParamValue]; params: {'collection': ParamValue,'id': ParamValue} }
    'cms_proxy.get': { paramsTuple: [...ParamValue[]]; params: {'*': ParamValue[]} }
    'auth_errors.index': { paramsTuple?: []; params?: {} }
    'auth_errors.stats': { paramsTuple?: []; params?: {} }
    'admin.list_users': { paramsTuple?: []; params?: {} }
    'admin.get_user': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin_sessions.list_user_sessions': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'billing.get_or_create_account': { paramsTuple?: []; params?: {} }
    'billing.get_subscriptions': { paramsTuple?: []; params?: {} }
    'billing.get_invoices': { paramsTuple?: []; params?: {} }
    'billing.get_payment_methods': { paramsTuple?: []; params?: {} }
    'billing.get_plans': { paramsTuple?: []; params?: {} }
    'feed.get_personalized_feed': { paramsTuple?: []; params?: {} }
    'feed.get_followed_spaces': { paramsTuple?: []; params?: {} }
    'feed.check_follow_status': { paramsTuple: [ParamValue]; params: {'spaceId': ParamValue} }
    'engagement.get_like_status': { paramsTuple: [ParamValue,ParamValue]; params: {'contentType': ParamValue,'contentId': ParamValue} }
    'trending.get_trending': { paramsTuple?: []; params?: {} }
  }
  HEAD: {
    'user.get_by_username': { paramsTuple: [ParamValue]; params: {'username': ParamValue} }
    'auth.get_session': { paramsTuple?: []; params?: {} }
    'auth.catch_all': { paramsTuple: [...ParamValue[]]; params: {'*': ParamValue[]} }
    'user.me': { paramsTuple?: []; params?: {} }
    'user.index': { paramsTuple?: []; params?: {} }
    'cms_proxy.get_collection': { paramsTuple: [ParamValue]; params: {'collection': ParamValue} }
    'cms_proxy.get_item': { paramsTuple: [ParamValue,ParamValue]; params: {'collection': ParamValue,'id': ParamValue} }
    'cms_proxy.get': { paramsTuple: [...ParamValue[]]; params: {'*': ParamValue[]} }
    'auth_errors.index': { paramsTuple?: []; params?: {} }
    'auth_errors.stats': { paramsTuple?: []; params?: {} }
    'admin.list_users': { paramsTuple?: []; params?: {} }
    'admin.get_user': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin_sessions.list_user_sessions': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'billing.get_or_create_account': { paramsTuple?: []; params?: {} }
    'billing.get_subscriptions': { paramsTuple?: []; params?: {} }
    'billing.get_invoices': { paramsTuple?: []; params?: {} }
    'billing.get_payment_methods': { paramsTuple?: []; params?: {} }
    'billing.get_plans': { paramsTuple?: []; params?: {} }
    'feed.get_personalized_feed': { paramsTuple?: []; params?: {} }
    'feed.get_followed_spaces': { paramsTuple?: []; params?: {} }
    'feed.check_follow_status': { paramsTuple: [ParamValue]; params: {'spaceId': ParamValue} }
    'engagement.get_like_status': { paramsTuple: [ParamValue,ParamValue]; params: {'contentType': ParamValue,'contentId': ParamValue} }
    'trending.get_trending': { paramsTuple?: []; params?: {} }
  }
  POST: {
    'auth.sign_in_email': { paramsTuple?: []; params?: {} }
    'auth.sign_up_email': { paramsTuple?: []; params?: {} }
    'auth.sign_out': { paramsTuple?: []; params?: {} }
    'auth.catch_all': { paramsTuple: [...ParamValue[]]; params: {'*': ParamValue[]} }
    'user.upload_avatar': { paramsTuple?: []; params?: {} }
    'cms_proxy.post': { paramsTuple: [...ParamValue[]]; params: {'*': ParamValue[]} }
    'auth_errors.reconcile': { paramsTuple?: []; params?: {} }
    'admin.create_user': { paramsTuple?: []; params?: {} }
    'admin.sync_all_users': { paramsTuple?: []; params?: {} }
    'admin.sync_user': { paramsTuple?: []; params?: {} }
    'billing.create_subscription': { paramsTuple?: []; params?: {} }
    'billing.add_payment_method': { paramsTuple?: []; params?: {} }
    'feed.follow_space': { paramsTuple: [ParamValue]; params: {'spaceId': ParamValue} }
    'engagement.track_view': { paramsTuple: [ParamValue,ParamValue]; params: {'contentType': ParamValue,'contentId': ParamValue} }
    'engagement.like_content': { paramsTuple: [ParamValue,ParamValue]; params: {'contentType': ParamValue,'contentId': ParamValue} }
  }
  OPTIONS: {
    'auth.catch_all': { paramsTuple: [...ParamValue[]]; params: {'*': ParamValue[]} }
  }
  PUT: {
    'auth.catch_all': { paramsTuple: [...ParamValue[]]; params: {'*': ParamValue[]} }
  }
  PATCH: {
    'auth.catch_all': { paramsTuple: [...ParamValue[]]; params: {'*': ParamValue[]} }
    'user.update_profile': { paramsTuple?: []; params?: {} }
    'user.toggle_status': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'cms_proxy.patch': { paramsTuple: [...ParamValue[]]; params: {'*': ParamValue[]} }
    'auth_errors': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.update_user': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.toggle_status': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
  DELETE: {
    'auth.catch_all': { paramsTuple: [...ParamValue[]]; params: {'*': ParamValue[]} }
    'cms_proxy.delete': { paramsTuple: [...ParamValue[]]; params: {'*': ParamValue[]} }
    'admin.delete_user': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin_sessions.revoke_all_sessions': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin_sessions.revoke_session': { paramsTuple: [ParamValue]; params: {'sessionToken': ParamValue} }
    'billing.cancel_subscription': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'feed.unfollow_space': { paramsTuple: [ParamValue]; params: {'spaceId': ParamValue} }
    'engagement.unlike_content': { paramsTuple: [ParamValue,ParamValue]; params: {'contentType': ParamValue,'contentId': ParamValue} }
  }
}
declare module '@adonisjs/core/types/http' {
  export interface RoutesList extends ScannedRoutes {}
}