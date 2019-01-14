const { Sequelize, sequelize } = require('./db');

const dbSaleDetail = sequelize.define('salesDetails', {
    item: { type: Sequelize.INTEGER, 
        primaryKey: true },
    saleNumber: { type: Sequelize.BIGINT, allowNull: false, 
        primaryKey: true,
        references: { model: 'sales', key: 'number'} },
    type: { type: Sequelize.CHAR, allowNull: false,
        primaryKey: true,
        references: { model: 'sales', key: 'type'} },
    id_Product: { type: Sequelize.INTEGER, 
        references: { model: 'products', key: 'id' } },
    quantity: { type: Sequelize.FLOAT, validate: { isNumeric: true }},
    price: { type: Sequelize.FLOAT },
});


class SaleDetail {
    constructor() {
        this.create = async ({ item, saleNumber, type, codProduct, quantity }) => {
            try {
                await sequelize
                    .sync();
                const result = await dbSaleDetail.create({
                    item,
                    saleNumber,
                    type,
                    codProduct,
                    quantity,
                });
                
                return result;
            } catch (e) {
                console.error(e);
            }
        }

        this.getAll = saleNumber => {

            return dbSaleDetail.findAll( {
                where: { saleNumber },
                attributes: [ 'item', 'saleNumber', 'type', 'codProduct', 'quantity' ]
            })
        }

    }
}

module.exports = new SaleDetail();