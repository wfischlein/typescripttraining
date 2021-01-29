// That's an example dependency over there ^

console.log("Hello from TypeScript");
console.log("Make some changes here and see if the watch->compile->reload cycle works");

const rootUrl = "https://bad-api-assignment.reaktor.com"
const manufacturerAvailability = {};
import _ from "lodash";

interface ClothingBase {
    type: string;
    id: string;
    name: string;
    price: number;
    manufacturer: string;
}

type Clothing = Jacket | Shirt | Accessory;

interface Jacket extends ClothingBase {
    type: "jackets";
}

interface Shirt extends ClothingBase {
    type: "shirts";
}

interface Accessory extends ClothingBase {
    type: "accessories";
}

async function fetchStuff(resource: string) {
    const url = rootUrl + resource;
    const response = await fetch(url)

    if (response.status !== 200) {
        console.log("Error fetching " + url + ": " + response.status);
    } else {
        console.log("success fetching " + url + ": " + response)
        return response.json()
    }

}

function createCustomNode(parent: any, tagname: any, content: any) {
    const newElement = document.createElement(tagname);
    const textNode = document.createTextNode(content);
    newElement.appendChild(textNode)
    parent.appendChild(newElement)
}

function createRow(parentnodeid: any) {
    const parent = document.getElementById(parentnodeid);
    const newElement = document.createElement("tr");
    if (parent !== null)
        parent.appendChild(newElement)
    return newElement;
}

// function availabilityArrived(argument: any) {
//     console.log("yay " + (argument.response.map(a => (a.id))));
// //  Object.getOwnPropertyNames
// }
//
async function createItemRow(parentnodeid: any, item: Clothing) {
    const row = createRow(parentnodeid);

    createCustomNode(row, "td", item.id);
    createCustomNode(row, "td", item.manufacturer);
    createCustomNode(row, "td", item.type);
    createCustomNode(row, "td", item.name);
    createCustomNode(row, "td", item.price);
    fetchStuff("/availability/" + item.manufacturer).then(a => {
        console.log(a.response)
        a.response
            .filter((b: { id: string; }) => (b.id == item.id.toUpperCase()))
            .map((b: { DATAPAYLOAD: string; }) => b.DATAPAYLOAD)
            .forEach((b: string) => {
                createCustomNode(row, "td", b)
            });
    })
}

async function fetchProducts<T>(productType: string, sliceIndex: number, sliceSize: number):Promise<T[]> {
    const start = sliceIndex * sliceSize;
    const listItems: T[] = (await fetchStuff("/products/" + productType)).slice(start, sliceSize);


    return listItems
}

function createTable(tableNodeId: any, items: Array<any>) {
    const row = createRow(tableNodeId);
    createCustomNode(row, "th", "id");
    createCustomNode(row, "th", "Manufacturer");
    createCustomNode(row, "th", "Type");
    createCustomNode(row, "th", "Name");
    createCustomNode(row, "th", "Price");
    createCustomNode(row, "th", "Availability");


    items.forEach(item => createItemRow(tableNodeId, item))
}

async function fetchClothing<T>(type: string, sliceIndex: number, sliceSize: number):Promise<T[]> {
    return await fetchProducts(type, sliceIndex, sliceSize);

}

async function main() {
    // would like to have a chained call here instead of declaring new variables but didn't make it through the compiler
    const jackets:Clothing[] = (await(fetchClothing("jackets", 0, 20)))
    const jacketsAndShirts:Clothing[] = jackets.concat(await(fetchClothing("shirts", 0, 20)))
    const allClothing:Clothing[] = jacketsAndShirts.concat(await(fetchClothing("accessories", 0, 20)))
    const sortedClothing = _.sortBy(allClothing, "name")
    createTable("clothings", sortedClothing)
}

main()

