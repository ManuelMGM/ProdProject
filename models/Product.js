const { Sequelize, sequelize } = require('./db');

const dbProduct = sequelize.define('products', {
    codProduct: { type: Sequelize.STRING, allowNull: false, unique: true },
    description: { type: Sequelize.STRING, allowNull: false },
    typeProduct: { type: Sequelize.STRING },
    stock: { type: Sequelize.FLOAT },
    minimumStock: { type: Sequelize.FLOAT },
    price: { type: Sequelize.FLOAT },
    //warranty: { type: Sequelize.INTEGER }
});

class Product {
    constructor() {
        this.create = async ({ codProduct, description, typeProduct, stock, minimumStock, price }) => {
            try {
                return sequelize
                .sync()
                .then(() =>
                dbProduct.create({
                    codProduct,
                    description,
                    typeProduct,
                    stock,
                    minimumStock,
                    price
                })
            )
            .then(result => result);
            } catch (e) {
                console.error(e);
            }
        }

        this.getAll = () => {

            return dbProduct.findAll( {
                attributes: [ "id", "codProduct", "price", "description", "typeProduct", "stock" ]
            });
        }



    }
}

module.exports = new Product();