/**
 * Created by thangtyt on 1/20/17.
 */


module.exports = function (component,app) {
    let controller = component.controllers.frontend;
    let jwtAuth = ArrowHelper.jwt;
    return {
        "/qa/report/:questionId" : {
            post: {
                handler: [jwtAuth,controller.reportQuestion]
            }
        }
    }
}