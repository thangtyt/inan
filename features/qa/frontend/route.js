/**
 * Created by thangtyt on 1/20/17.
 */


module.exports = function (component,app) {
    let controller = component.controllers.frontend;
    let jwtAuth = ArrowHelper.jwt;
    return {
        "/qa/report/:questionId([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})" : {
            post: {
                handler: [jwtAuth,controller.reportQuestion]
            }
        }
    }
}