"use strict";

const path = require("path");
const isLocal = typeof process.pkg === "undefined";
const basePath = isLocal ? process.cwd() : path.dirname(process.execPath);
const fs = require("fs");
const layersDir = `${basePath}/layers`;
const { layerConfigurations, rarest } = require(path.join(basePath, "/src/config.js"));
const { getElements } = require("../src/main.js");

// read json data
let rawdata = fs.readFileSync(`${basePath}/build/json/_metadata.json`);
let data = JSON.parse(rawdata);
let editionSize = data.length;

let rarityData = [];

// intialize layers to chart
layerConfigurations.forEach((config) => {
  let layers = config.layersOrder;

  layers.forEach((layer) => {
    // get elements for each layer
    let elementsForLayer = [];
    let elements = getElements(`${layersDir}/${layer.name}/`);
    elements.forEach((element) => {
      // just get name and weight for each element
      let rarityDataElement = {
        trait: element.name,
        occurrence: 0, // initialize at 0
      };
      elementsForLayer.push(rarityDataElement);
    });
    let layerName =
      layer.options?.["displayName"] != undefined
        ? layer.options?.["displayName"]
        : layer.name;
    // don't include duplicate layers
    if (!rarityData.includes(layer.name)) {
      // add elements for each layer to chart
      rarityData[layerName] = elementsForLayer;
    }
  });
});

// fill up rarity chart with occurrences from metadata
data.forEach((element) => {
  let attributes = element.attributes;
  attributes.forEach((attribute) => {
    let traitType = attribute.trait_type;
    let value = attribute.value;

    let rarityDataTraits = rarityData[traitType];
    rarityDataTraits.forEach((rarityDataTrait) => {
      if (rarityDataTrait.trait == value) {
        // keep track of occurrences
        rarityDataTrait.occurrence++;
      }
    });
  });
});

// convert occurrences to percentages
for (var layer in rarityData) {
  for (var attribute in rarityData[layer]) {
    // convert to percentage
    rarityData[layer][attribute].occurrence =
      (rarityData[layer][attribute].occurrence / editionSize) * 100;

    // show two decimal places in percent
    rarityData[layer][attribute].occurrence =
      rarityData[layer][attribute].occurrence.toFixed(2);
  }
}

// clear up rarity
for(var i=0; i<3; i++) {
  for (var layer in rarityData) {
    for (var attribute in rarityData[layer]) {
      if(rarityData[layer][attribute].occurrence == 0.00) {
        rarityData[layer].splice(attribute, 1);
      }
    }
  }
}
//console.log(rarityData);

let imageRarityData = [];
data.forEach((element, index) => {
  imageRarityData[index] = {imageName: element.name, points: 0};
  let points = 0.00;
  element.attributes.forEach((object) => {
    let occurrence = rarityData[object.trait_type].find((obj) => obj.trait == object.value).occurrence;
    points += parseFloat(occurrence);
  });
  imageRarityData[index].points = points;
});
//console.log(imageRarityData);

// reorder rarest at top
imageRarityData.sort((a, b) => { return a.points - b.points; });
//console.log(imageRarityData);

let sliced = imageRarityData.slice(0, rarest.top)
//console.log(sliced);

console.log(`The top ${rarest.top} rarest in this collection are:`);
sliced.forEach((object, index) => {
  console.log((index+1) + '. ' + object.imageName);  
});