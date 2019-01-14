const { Sequelize, sequelize } = require('./db');

const dbSale = sequelize.define('sales', {
    number: { type: Sequelize.BIGINT, allowNull: false, validate: { isNumeric: true }},
    type: { type: Sequelize.CHAR, allowNull: false },
    date: { type: Sequelize.DATEONLY, validate: { isDate: true }},
    cuil: { type: Sequelize.BIGINT, validate: { isNumeric: true }},
    amount: { type: Sequelize.FLOAT },
});

class Sale {
    constructor() {
        this.create = async ({ number, type, date, cuil, amount }) => {
            try {
                //must be a transaction creating each details in a for loop
                await sequelize
                    .sync();
                const result = await dbSale.create({
                    number,
                    type,
                    date,
                    cuil,
                    amount
                });
                
                return result;
            } catch (e) {
                console.error(e);
            }
        }

        this.getAll = () => {

            return dbSale.findAll( {
                attributes: [ "number", "type", "date", "cuil", "amount" ]
            })
        }

        this.getSale = ( number ) => {
            
            return dbSale.findAll( {
                where: { number },
                attributes: [ "number", "type", "date", "cuil", "amount" ]
            })            
        }



    }
}

module.exports = new Sale();