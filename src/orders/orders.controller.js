const path = require("path");

// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));

// Use this function to assigh ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /orders handlers needed to make the tests pass

//POST:create on /orders
const postHasDeliverTo = (req, res, next) => {
    const { data : { deliverTo } = {} } = req.body;
    if(deliverTo){
        next();
    }
    else{
        next({
            status: 400,
            message: "Order must include a deliverTo"
        });
    }
};

const postHasMobileNumber = (req, res, next) => {
    const { data : { mobileNumber } = {} } = req.body;
    if(mobileNumber){
        next();
    }
    else{
        next({
            status: 400,
            message: "Order must include a mobileNumber"
        });
    }
};

const postHasDishes = (req, res, next) => {
    const { data : { dishes } = {} } = req.body;
    if(dishes && dishes.length > 0 && Array.isArray(dishes)){
        next();
    }
    else{
        next({
            status: 400,
            message: "Order must include at least one dish"
        });
    }
};

const postHasDishesWithQuantities = (req, res, next) => {
    const { data : { dishes } = {} } = req.body;
    for(const [index, dish] of dishes.entries()){
        if(dish.quantity && dish.quantity > 0 && Number.isInteger(dish.quantity)){
            //console.log(`dish at index ${index} passes the quantity test`)
        }
        else{
            return next({
                status: 400,
                message: `Dish ${index} must have a quantity that is an integer greater than 0`
            })
        }
    }
    //console.log("all dishes passed this test")
    return next();
};
//------------------

//GET/read for /orders/:orderId
const orderIdExists = (req, res, next) => {
    const { orderId } = req.params;
    const foundId = orders.find(order => order.id === orderId);
    if(foundId){
        res.locals.orders = foundId;
        return next();
    }
    else{
        return next({
            status: 404,
            message: `no order matched: ${orderId}`
        })
    }
};
//----------------------

//PUT/update /orders/:orderId
const orderIdMatchesBodyId = (req, res, next) => {
    const { data : { id } = {} } = req.body;
    const { orderId } = req.params;
    if(id){
    if(orderId === id){
        return next();
    }
    else{
        return next({
            status: 400,
            message: `Order id does not match route id. Order: ${id}, Router ${orderId}.`
        })
    }}
    return next();
};

const updateStatusCheck = (req, res, next) => {
    const { data: { status } = {} } = req.body;
    const statusValidator = status === "pending" || status === "preparing" || status === "out-for-delivery" || status === "delivered"
    if(statusValidator){
        if(status === "delivered"){
            return next({
                status: 400,
                message: "A delivered order cannot be changed"
            })
        }
        else{
            return next();
        }
    }
    else{
        return next({
            status: 400,
            message: "Order must have a status of pending, preparing, out-for-delivery, delivered"
        })
    }
};
//-----------------------

//DELETE/delete /order/:orderId
const destroyStatusCheck = (req, res, next) => {
    const { orderId } = req.params;
    const foundId = orders.find(order => order.id === orderId);
    if(foundId.status === "pending"){
        return next();
    }
    else{
        return next({
            status: 400,
            message: "An order cannot be deleted unless it is pending"
        })
    }
};
//---------------

//CRUDL Functions:
const create = (req, res, next) => {
    const { data : { deliverTo, mobileNumber, status, dishes } = {} } = req.body;
    const newId = nextId();
    const newOrder = {
        id: newId,
        deliverTo,
        mobileNumber,
        status,
        dishes
    };
    orders.push(newOrder);
    res.status(201).json({ data : newOrder })
};

const read = (req, res, next) => {
    res.status(200).json({ data : res.locals.orders })
};

const update = (req, res, next) => {
    const { data : { deliverTo, mobileNumber, status, dishes } = {} } = req.body;
    const { orderId } = req.params;
    const indexOfOrder = orders.findIndex(order => order.id === orderId);
    orders[indexOfOrder] = {
        ...orders[indexOfOrder],
        deliverTo,
        mobileNumber,
        status,
        dishes
    };
    res.status(200).json({ data : orders[indexOfOrder] })
};

const destroy = (req, res, next) => {
    const { orderId } = req.params;
    const idToBeDeleted = orders.findIndex(order => order.id === orderId);
    orders.splice(idToBeDeleted, 1);
    return res.sendStatus(204);
};

const list = (req, res, next) => {
    res.status(200).json({ data : orders })
};

module.exports = {
    create: [postHasDeliverTo, postHasMobileNumber, postHasDishes, postHasDishesWithQuantities, create],
    read: [orderIdExists, read],
    update: [orderIdExists, orderIdMatchesBodyId, postHasDeliverTo, postHasMobileNumber, postHasDishes, postHasDishesWithQuantities, updateStatusCheck, update],
    delete: [orderIdExists, destroyStatusCheck, destroy],
    list
}