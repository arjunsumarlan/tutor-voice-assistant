declare module "leaflet-routing-machine" {
  import * as L from "leaflet";
  namespace Routing {
    function control(options: any): any;
  }
}

// declare module 'leaflet' {
//     namespace Routing {
//       function control(options: any): any;
//       function latLngBounds(latlngs: L.LatLngExpression[]): L.LatLngBounds
//       function icon(options: L.IconOptions): L.Icon<L.IconOptions>
//     }
//   }