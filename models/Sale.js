const { Sequelize, sequelize } = require('./db');

const dbSale = sequelize.define('sales', {
    number: { type: Sequelize.BIGINT, allowNull: false,
        primaryKey: true,
        validate: { isNumeric: true }},
    type: { type: Sequelize.CHAR, allowNull: false,
        primaryKey: true },
    date: { type: Sequelize.DATEONLY, validate: { isDate: true }},
    amount: { type: Sequelize.FLOAT },
});

class Sale {
    constructor() {
        this.create = async ({ number, type, date, amount }) => {
            try {
                //must be a transaction creating each details in a for loop
                await sequelize
                    .sync();
                const result = await dbSale.create({
                    number,
                    type,
                    date,
                    amount
                });
                
                return result;
            } catch (e) {
                console.error(e);
            }
        }

        this.getAll = () => {

            return dbSale.findAll( {
                attributes: [ "number", "type", "date", "amount" ]
            })
        }

        this.getSale = ( number ) => {
            
            return dbSale.findAll( {
                where: { number },
                attributes: [ "number", "type", "date", "amount" ]
            })            
        }



    }
}

module.exports = new Sale();