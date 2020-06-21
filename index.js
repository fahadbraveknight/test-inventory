const args = process.argv.slice(2);

const processTransaction = (params) => {
    const { purchaseCountry, passportCountry, items } = params;

    let Inventory = {
        germany : {
            mask : {
                units: 100,
                price: 100
            },
            gloves : {
                units: 50,
                price: 150
            },
        },
        uk : {
            mask : {
                units: 100,
                price: 65
            },
            gloves : {
                units: 100,
                price: 100
            },
        },
    }
    
    let finalPrice = 0;

    let processItem = ( item, qty) => {
        const baseBatchUnit = 10;
        let batches = parseInt(qty/baseBatchUnit);
        let remainingQty = Number(qty%baseBatchUnit);
        let groups = [...[...Array(batches).keys()].map((i) => baseBatchUnit), remainingQty]

        for(let i = 0; i < groups.length; i++){
            let result = {
                price: 0,
                inventory: '',
                units: 0
            };

            for(let inventory in Inventory){
                if(Inventory[inventory][item] && groups[i] && Inventory[inventory][item].units >= groups[i]){
                    let inventoryPrice = Inventory[inventory][item].price * groups[i];

                    /* Shipping */

                    if(purchaseCountry !== inventory){
                        const hasDiscount = inventory === passportCountry;
                        const defaultShipingCost = 400;
                        let shippingCost = hasDiscount ? defaultShipingCost - defaultShipingCost * 0.2 : defaultShipingCost;
                        inventoryPrice = shippingCost + inventoryPrice;
                    }

                    if(!result.inventory || result.price > inventoryPrice)
                    {
                        result = {
                            price: inventoryPrice,
                            inventory: inventory,
                            units: groups[i]
                        };
                    }
                }
            }

            if(result.inventory){
                finalPrice += result.price;
                Inventory[result.inventory][item].units = Inventory[result.inventory][item].units - result.units;
            }
        }
    }

    let stockAvailable = true;
    
    for( let item of items) {
        let totalStock = 0;
        for(let inventory in Inventory) totalStock += Inventory[inventory][item.type].units;

        if(totalStock < item.qty){
            finalPrice = 'OUT_OF_STOCK';
            stockAvailable = false;
            break;
        }
    }

    if(stockAvailable){
        for( let item of items) {
            processItem( item.type, item.qty);
        }
    }

    console.log(
        finalPrice, 
        Inventory['uk']['mask'].units,
        Inventory['germany']['mask'].units,
        Inventory['uk']['gloves'].units,
        Inventory['germany']['gloves'].units,
    )
}

const init = () => {
    if(!args[0]){
        throw new Error('Arguments Required.')
    }
    const input = args[0].split(':');
    const purchaseCountry = input[0].toLowerCase();
    const passport = (input.length === 6) ? input[1] : '';
    const passportCountry = passport ? passport[0] ===  'B' ? 'uk' : 'germany' : '';
    const items = [];
    const itemOffset = passport ? 1 : 0;

    for(let i = 1 + itemOffset; i < 5 + itemOffset; i = i + 2 ){
        items.push({
            type : input[i].toLowerCase(),
            qty : Number(input[i + 1]),
        })
    }

    processTransaction({
        purchaseCountry,
        passportCountry,
        items
    });
}

init();