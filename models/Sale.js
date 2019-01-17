const { Sequelize, sequelize } = require('./db');
const SaleDetail = require('./SaleDetail');

const dbSale = sequelize.define('sales', {
    number: { type: Sequelize.BIGINT, allowNull: false, //unique: true,
        primaryKey: true,
        validate: { isNumeric: true }},
    type: { type: Sequelize.STRING, allowNull: false, //unique: true,
        primaryKey: true },
    amount: { type: Sequelize.FLOAT },
});

class Sale {
    constructor() {
        this.create = async ({type, amount, details}) => {
            try {
                await sequelize
                    .sync();
                const number = await sequelize.query('SELECT MAX("number") FROM sales WHERE type = ?', 
                    {replacements: [type], type: sequelize.QueryTypes.SELECT})
                    .then(result => { 
                        if (parseInt(result[0].max, 10) > 0) {

                            return (parseInt(result[0].max, 10) + 1);
                        }else {

                            return 1;
                        };
                        }) ;
                const detailList = [];
                
                return sequelize.transaction( t => {
                    return dbSale.create({
                        number,
                        type,
                        amount
                    }, {transaction: t}).then(() => {
                        return details.forEach( item => {
                            const newDetail = SaleDetail.create({ saleNumber: number, type,
                                id_Product: item.id_Product, price: item.price, quantity: item.quantity});
                            detailList.push(newDetail);
                        });
                    }, {transaction: t});
                }).then( result => result)
                .catch(err => {
                    console.error(err);
                })
            } catch (e) {
                console.error(e);
            }
        }

        this.getAll = () => {

            return dbSale.findAll( {
                attributes: [ 'number', 'type', 'amount' ]
            })
        }

        this.getSale = ( number ) => {
            
            return dbSale.findAll( {
                where: { number },
                attributes: [ 'number', 'type', 'amount' ]
            })            
        }



    }
}

module.exports = new Sale();