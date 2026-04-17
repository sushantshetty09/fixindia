import fs from 'fs';
import wkx from 'wkx';

console.log('Reading WKB data...');
const wards = JSON.parse(fs.readFileSync('./server/src/utils/bengaluru_wards_full.json', 'utf8'));

console.log('Converting to GeoJSON FeatureCollection...');
const features = wards.map(w => {
  const geom = wkx.Geometry.parse(Buffer.from(w.boundary_wkb, 'hex')).toGeoJSON();
  return {
    type: 'Feature',
    properties: {
      ward_number: w.ward_number,
      ward_name: w.ward_name,
      zone: w.zone,
      assembly: w.assembly,
      parliament: w.parliament,
      mla_name: w.mla_name,
      mla_party: w.mla_party,
      mp_name: w.mp_name
    },
    geometry: geom
  };
});

const featureCollection = {
  type: 'FeatureCollection',
  features
};

fs.writeFileSync('./public/wards.geojson', JSON.stringify(featureCollection));
console.log('Successfully saved to public/wards.geojson (' + features.length + ' features)');
