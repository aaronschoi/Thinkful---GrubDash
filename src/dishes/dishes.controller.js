const path = require("path");

// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /dishes handlers needed to make the tests pass

//PUT request for /dishes:
const postHasName = (req, res, next) => {
    const { data: { name } = {} } = req.body;
    if(name && name !== ""){
        next();
    }
    else{
        next({
            status: 400,
            message: "Dish must include a name"
        })
    }
};

const postHasDescription = (req, res, next) => {
    const { data: {description} = {}} = req.body;
    if(description && description !== ""){
        next();
    }
    else{
        next({
            status: 400,
            message: "Dish must include a description"
        })
    }
};

const postHasPrice = (req, res, next) => {
    const { data: { price } = {} } = req.body;
    if(!price || price <= 0){
        next({
            status: 400,
            message: "Dish must include a price"
        })
    }
    if(Number.isInteger(price)){
        next();
    }
    else{
        next({
            status: 400,
            message: "Dish must have a price that is an integer greater than 0"
        })
    }
};

const postHasImage = (req, res, next) => {
    const { data: { image_url } = {} } = req.body;
    if(image_url){
        next();
    }
    else {
        next({
            status: 400,
            message: "Dish must include a image_url"
        })
    }
};
//-------------------------

//GET:read request for /:dishId
const idExists = (req, res, next) => {
    const { dishId } = req.params;
    const foundId = dishes.find(dish => dish.id === dishId);
    if(foundId){
        res.locals.dishes = foundId;
        next();
    }
    else{
        next({
            status: 404,
            message: "no match is found"
        })
    }

};

//------------------------------

//CRUDL functions
const create = (req, res, next) => {
    const { data : { name, description, price, image_url } = {} } = req.body;
    const newId = nextId();
    const newDish = {
        id: newId,
        name,
        description,
        price,
        image_url
    };
    dishes.push(newDish);
    res.status(201).json({ data : newDish })
};

const read = (req, res, next) => {
    res.json({ data : res.locals.dishes })
};

const update = (req, res, next) => {

};

const destroy = (req, res, next) => {

};

const list = (req, res, next) => {
    res.status(201).json({ data : dishes })
};

module.exports = {
    create: [postHasName, postHasDescription, postHasPrice, postHasImage, create],
    read: [idExists, read],
    update: [],
    delete: [],
    list: [list]
}