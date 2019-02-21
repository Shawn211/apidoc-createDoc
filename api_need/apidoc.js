/**
 * @api {POST} /user/need/save 添加用户需求
 * @apiVersion 1.0.0
 * @apiGroup NEED
 *
 * @apiParam (query) {String=small,huge} need_name="huge" 需求者名称-非空
 * @apiParam (body) {Number=1,2,21} e_mail 用户邮箱-非空邮箱格式
 * @apiParam (params) {Number{100-999}} phone=211 用户电话-非空
 * @apiParam (body) {String{..5}} [company_name] 需求公司名称
 * @apiParam {String{2..5}} [needs_desc] 需求描述-非空
 *
 * @apiSuccess {Object} code 返回码
 * @apiSuccess {Object} reason  中文解释
 * @apiSuccess {String[]} data  返回数据
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          "code":0,
 *          "reason":"需求已经提交了，我们的工作人员会在2个工作日内和您取得联系!",
 *          "data":[]
 *      }
 */