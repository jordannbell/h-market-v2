declare global {
 interface Window {
 google: typeof google
 }
}

declare namespace google {
 namespace maps {
 class Map {
 constructor(mapDiv: HTMLElement, opts?: MapOptions)
 setCenter(latlng: LatLng | LatLngLiteral): void
 fitBounds(bounds: LatLngBounds): void
 }

 class Marker {
 constructor(opts?: MarkerOptions)
 setMap(map: Map | null): void
 getPosition(): LatLng
 addListener(eventName: string, handler: Function): void
 }

 class InfoWindow {
 constructor(opts?: InfoWindowOptions)
 open(map: Map, anchor?: Marker): void
 }

 class LatLng {
 constructor(lat: number, lng: number)
 }

 class LatLngBounds {
 constructor()
 extend(latlng: LatLng): void
 }

 class DirectionsService {
 route(request: DirectionsRequest, callback: (result: DirectionsResult | null, status: DirectionsStatus) => void): void
 }

 class DirectionsRenderer {
 constructor(opts?: DirectionsRendererOptions)
 setMap(map: Map): void
 setDirections(result: DirectionsResult): void
 }

 class Geocoder {
 geocode(request: GeocoderRequest, callback: (results: GeocoderResult[] | null, status: GeocoderStatus) => void): void
 }

 enum TravelMode {
 DRIVING = 'DRIVING',
 WALKING = 'WALKING',
 BICYCLING = 'BICYCLING',
 TRANSIT = 'TRANSIT'
 }

 interface MapOptions {
 center?: LatLng | LatLngLiteral
 zoom?: number
 styles?: MapTypeStyle[]
 }

 interface MarkerOptions {
 position?: LatLng | LatLngLiteral
 map?: Map
 title?: string
 icon?: string | Icon | Symbol
 }

 interface Icon {
 url: string
 scaledSize?: Size
 anchor?: Point
 }

 interface Size {
 width: number
 height: number
 }

 interface Point {
 x: number
 y: number
 }

 interface InfoWindowOptions {
 content?: string | Element
 }

 interface LatLngLiteral {
 lat: number
 lng: number
 }

 interface MapTypeStyle {
 featureType?: string
 elementType?: string
 stylers?: any[]
 }

 interface DirectionsRequest {
 origin: LatLng | LatLngLiteral | string
 destination: LatLng | LatLngLiteral | string
 travelMode: TravelMode
 }

 interface DirectionsResult {
 routes: DirectionsRoute[]
 }

 interface DirectionsRoute {
 legs: DirectionsLeg[]
 }

 interface DirectionsLeg {
 distance: Distance
 duration: Duration
 steps: DirectionsStep[]
 }

 interface Distance {
 text: string
 value: number
 }

 interface Duration {
 text: string
 value: number
 }

 interface DirectionsStep {
 distance: Distance
 duration: Duration
 instructions: string
 }

 interface DirectionsRendererOptions {
 map?: Map
 suppressMarkers?: boolean
 }

 interface GeocoderRequest {
 address?: string
 location?: LatLng | LatLngLiteral
 }

 interface GeocoderResult {
 geometry: {
 location: LatLng
 }
 formatted_address: string
 }

 type GeocoderStatus = 'OK' | 'ZERO_RESULTS' | 'OVER_QUERY_LIMIT' | 'REQUEST_DENIED' | 'INVALID_REQUEST' | 'UNKNOWN_ERROR'

 type DirectionsStatus = 'OK' | 'NOT_FOUND' | 'ZERO_RESULTS' | 'MAX_WAYPOINTS_EXCEEDED' | 'MAX_ROUTE_LENGTH_EXCEEDED' | 'INVALID_REQUEST' | 'OVER_QUERY_LIMIT' | 'REQUEST_DENIED' | 'UNKNOWN_ERROR'
 }
}

export {}
