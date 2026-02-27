import xml.etree.ElementTree as ET
from typing import List, Tuple
import time
from pathlib import Path

from grid_registry import GridRegistry, SigmaID

class KMLGenerator:
    """V77: SGLOVA Logic - Generates a Gauge-Holographic KML Membrane."""
    # Stellar Intent Axis Seed: The Polar Axis (NCP)
    # This is the global invariant constant.
    INTENT_AXIS_SEED = {"heading": 0, "tilt": 0, "roll": 0}

    def __init__(self, name: str = "Σ-Intent World", description: str = ""):
        self.root = ET.Element("kml", xmlns="http://www.opengis.net/kml/2.2")
        self.document = ET.SubElement(self.root, "Document")
        ET.SubElement(self.document, "name").text = name
        if description: ET.SubElement(self.document, "description").text = description
        self.grid = GridRegistry()
        self._add_styles()

    def set_view(self, lat: float, lon: float, alt: float, heading: float = 0, tilt: float = 0, range: float = 1000):
        """Sets the default LookAt view (The Architect's Focus)."""
        lookat = ET.SubElement(self.document, "LookAt")
        ET.SubElement(lookat, "longitude").text = str(lon)
        ET.SubElement(lookat, "latitude").text = str(lat)
        ET.SubElement(lookat, "altitude").text = str(alt)
        ET.SubElement(lookat, "heading").text = str(heading)
        ET.SubElement(lookat, "tilt").text = str(tilt)
        ET.SubElement(lookat, "range").text = str(range)
        ET.SubElement(lookat, "altitudeMode").text = "relativeToGround"

    def _add_styles(self):
        # Resonance Style (Glow)
        style = ET.SubElement(self.document, "Style", id="resonance_style")
        line = ET.SubElement(style, "LineStyle")
        ET.SubElement(line, "color").text = "ff00ffff" # Cyan
        ET.SubElement(line, "width").text = "4"
        poly = ET.SubElement(style, "PolyStyle")
        ET.SubElement(poly, "color").text = "8800ffff" # Translucent Cyan
        ET.SubElement(poly, "fill").text = "1"
        ET.SubElement(poly, "outline").text = "1"

        # Antenna Style (3D Building)
        style = ET.SubElement(self.document, "Style", id="antenna_style")
        poly = ET.SubElement(style, "PolyStyle")
        ET.SubElement(poly, "color").text = "aa00ffff" # Glassy Cyan
        ET.SubElement(poly, "fill").text = "1"
        ET.SubElement(poly, "outline").text = "1"

        # Pain Style (Discrepancy)
        style = ET.SubElement(self.document, "Style", id="pain_style")
        icon = ET.SubElement(style, "IconStyle")
        ET.SubElement(icon, "color").text = "ff0000ff" # Red
        ET.SubElement(icon, "scale").text = "1.2"

        # Cloudy Style (MODEL/Unverified Geo)
        style = ET.SubElement(self.document, "Style", id="cloudy_style")
        icon = ET.SubElement(style, "IconStyle")
        ET.SubElement(icon, "color").text = "88ffffff" # Translucent White
        ET.SubElement(icon, "scale").text = "0.8"

    def project_sigma_id(self, sigma_id: Tuple[int, str, str, str]) -> Tuple[float, float, float]:
        """V76: Projects ΣID (T,S,C,F) to Lens with Stellar Intent semantics."""
        T, S, C, F = sigma_id
        
        # S (Shell): Intent Crystal Density -> Altitude
        # Higher density (Soil) is deeper/lower, lower density (Cloud) is higher.
        shell_alt = {
            "cloud": 8000, # Stellar intent spread
            "sea": 3000,   # Flow alignment
            "soil": 500    # Crystallized core
        }
        alt_base = shell_alt.get(str(S).lower(), 1000)
        
        # C (Cell) mapping: Projected into the Stellar Frame (F)
        # For the pilot interface (KML), we map to Geo via the Gaia-Cache.
        base_lat, base_lon = 46.6, 32.6 # Reference point
        
        # F (Frame): Stellar Intent Axis (NCP)
        # Orientation is now invariant to the North Celestial Pole.
        lat_off = (hash(C) % 1000) * 0.0001
        lon_off = (hash(F) % 1000) * 0.0001
            
        return base_lat + lat_off, base_lon + lon_off, alt_base + (T * 10)

    def add_placemark(self, name: str, sigma_id: Tuple[int, str, str, str], 
                      style: str = "#default", description: str = "", links: dict = None):
        """Adds a placemark with Dual-Addressing support (V72.1)."""
        lat, lon, alt = self.project_sigma_id(sigma_id)
        
        # Override with Geo-Link if available
        if links and "geo" in links:
             geo_data = links["geo"]
             if isinstance(geo_data, list):
                 # V72.1 Cluster: Pick first or average for the simple marker
                 coord_str, _ = geo_data[0]
                 coords = coord_str.split(",")
             else:
                 coords = geo_data.split(",")
             lat, lon = float(coords[0]), float(coords[1])
        elif links and "geo_model" in links:
             # Virtual geo
             coords = links["geo_model"].split(",")
             lat, lon = float(coords[0]), float(coords[1])
             style = "#cloudy_style" # Cloud/Model style

        pm = ET.SubElement(self.document, "Placemark")
        if name: ET.SubElement(pm, "name").text = str(name)
        ET.SubElement(pm, "styleUrl").text = style
        if description: ET.SubElement(pm, "description").text = description
        
        # Orient using the Frame (F) - Deterministic projection
        lookat = ET.SubElement(pm, "LookAt")
        ET.SubElement(lookat, "longitude").text = str(lon)
        ET.SubElement(lookat, "latitude").text = str(lat)
        ET.SubElement(lookat, "heading").text = str(self.INTENT_AXIS_SEED["heading"])
        ET.SubElement(lookat, "tilt").text = str(self.INTENT_AXIS_SEED["tilt"])
        ET.SubElement(lookat, "range").text = "500"

        point = ET.SubElement(pm, "Point")
        ET.SubElement(point, "altitudeMode").text = "relativeToGround"
        ET.SubElement(point, "coordinates").text = f"{lon},{lat},{alt}"

    def generate_magnetic_discharge(self, center_lat: float, center_lon: float, entropy_level: float):
        """V77: Visualizes magnetic poles as zones of entropy weathering."""
        folder = ET.SubElement(self.document, "Folder")
        ET.SubElement(folder, "name").text = "MAGNETIC_DISCHARGE_POLE"
        
        # Visualize as a series of concentric translucent rings (Weathering)
        for i in range(1, 6):
            radius = i * entropy_level * 0.1
            pm = ET.SubElement(folder, "Placemark")
            ET.SubElement(pm, "styleUrl").text = "#cloudy_style"
            
            line = ET.SubElement(pm, "LineString")
            ET.SubElement(line, "tessellate").text = "1"
            ET.SubElement(line, "altitudeMode").text = "relativeToGround"
            
            coords = []
            for deg in range(0, 361, 10):
                # Using LUT from GridRegistry for consistency
                rad_lat = center_lat + radius * self.grid.get_deterministic_sin(deg)
                rad_lon = center_lon + radius * self.grid.get_deterministic_cos(deg)
                coords.append(f"{rad_lon},{rad_lat},500")
            
            ET.SubElement(line, "coordinates").text = " ".join(coords)

    def build_tile_membrane(self, cell_id: str, btc_height: int, folder: str = "txt/tiles"):
        """V77: Gaia-cache tile system for operational z-layers."""
        # T (btc_height) is the temporal bucket
        path = Path(folder) / f"tile_{cell_id}_T{btc_height}.kml"
        path.parent.mkdir(parents=True, exist_ok=True)
        self.build_membrane(str(path))
        return str(path)

    def build_tile(self, cell_id: str, bucket_id: int, folder: str = "tiles"):
        """Saves KML as a specific tile/chunk."""
        path = Path(folder) / f"tile_{cell_id}_t{bucket_id}.kml"
        path.parent.mkdir(parents=True, exist_ok=True)
        self.build_membrane(str(path))
        return str(path)

    def add_timespan(self, element, start: str, end: str = None):
        """Adds temporal dimension (The Year/Block focus)."""
        ts = ET.SubElement(element, "TimeSpan")
        ET.SubElement(ts, "begin").text = start
        if end: ET.SubElement(ts, "end").text = end

    def add_extruded_polygon(self, coords: List[Tuple[float, float]], height: float, 
                             name: str = "", style: str = "#antenna_style"):
        """Adds a 3D building-as-antenna."""
        pm = ET.SubElement(self.document, "Placemark")
        if name: ET.SubElement(pm, "name").text = name
        ET.SubElement(pm, "styleUrl").text = style
        
        poly = ET.SubElement(pm, "Polygon")
        ET.SubElement(poly, "extrude").text = "1"
        ET.SubElement(poly, "altitudeMode").text = "relativeToGround"
        boundary = ET.SubElement(poly, "outerBoundaryIs")
        ring = ET.SubElement(boundary, "LinearRing")
        
        coord_str = " ".join([f"{lon},{lat},{height}" for lat, lon in coords])
        ET.SubElement(ring, "coordinates").text = coord_str

    def add_path(self, coords: List[Tuple[float, float]], name: str = "", 
                 style: str = "#resonance_style", height: float = 10):
        """Adds a street-as-data-bus path."""
        pm = ET.SubElement(self.document, "Placemark")
        if name: ET.SubElement(pm, "name").text = name
        ET.SubElement(pm, "styleUrl").text = style
        
        line = ET.SubElement(pm, "LineString")
        ET.SubElement(line, "extrude").text = "0"
        ET.SubElement(line, "tessellate").text = "1"
        ET.SubElement(line, "altitudeMode").text = "relativeToGround"
        
        coord_str = " ".join([f"{lon},{lat},{height}" for lat, lon in coords])
        ET.SubElement(line, "coordinates").text = coord_str

    def add_pain_channel(self, claim_sigma: Tuple[int, str, str, str], 
                         trace_sigma: Tuple[int, str, str, str], 
                         claim_geo: str, trace_geo: str, 
                         severity: float = 0.5, attention: float = 0.5, energy: float = 0.5,
                         status: str = "OPEN"):
        """V73.8: Visual semantics (Width=Energy, Opacity=Attention)."""
        pm = ET.SubElement(self.document, "Placemark")
        ET.SubElement(pm, "name").text = f"PAIN:{status}"
        
        style = ET.SubElement(pm, "Style")
        line = ET.SubElement(style, "LineStyle")
        
        # Color Logic (AABBGGRR)
        base_color = "0000ff" # Red
        if status == "RESOLVED": base_color = "00ff00" # Green
        elif status == "COOLED": base_color = "aaaaaa" # Grey
        
        # Map Attention to Opacity (88 to ff)
        alpha = hex(int(136 + (attention * 119)))[2:].zfill(2)
        ET.SubElement(line, "color").text = f"{alpha}{base_color}"
        ET.SubElement(line, "width").text = str(2 + (energy * 10))
        
        ls = ET.SubElement(pm, "LineString")
        ET.SubElement(ls, "extrude").text = "1"
        ET.SubElement(ls, "tessellate").text = "1"
        ET.SubElement(ls, "altitudeMode").text = "relativeToGround"
        
        # Points: Claim (Cloud) and Trace (Soil/Sea)
        c_lat, c_lon = [float(x) for x in claim_geo.split(",")]
        t_lat, t_lon = [float(x) for x in trace_geo.split(",")]
        
        c_alt = self.project_sigma_id(claim_sigma)[2]
        t_alt = self.project_sigma_id(trace_sigma)[2]
        
        ET.SubElement(ls, "coordinates").text = f"{c_lon},{c_lat},{c_alt} {t_lon},{t_lat},{t_alt}"

    def add_trace_cluster(self, center_geo: str, radius_deg: float = 0.05):
        """Visualizes a cluster of traces as a protective envelope."""
        pm = ET.SubElement(self.document, "Placemark")
        ET.SubElement(pm, "name").text = "TRACE_CLUSTER_ENVELOPE"
        
        style = ET.SubElement(pm, "Style")
        poly = ET.SubElement(style, "PolyStyle")
        ET.SubElement(poly, "color").text = "4400ffaa" # Very translucent turquoise
        ET.SubElement(poly, "fill").text = "1"
        
        lat, lon = [float(x) for x in center_geo.split(",")]
        # Square approximation for the sphere/cluster for demo
        coords = [
            (lat-radius_deg, lon-radius_deg),
            (lat+radius_deg, lon-radius_deg),
            (lat+radius_deg, lon+radius_deg),
            (lat-radius_deg, lon+radius_deg),
            (lat-radius_deg, lon-radius_deg)
        ]
        
        pg = ET.SubElement(pm, "Polygon")
        ET.SubElement(pg, "altitudeMode").text = "relativeToGround"
        outer = ET.SubElement(pg, "outerBoundaryIs")
        lr = ET.SubElement(outer, "LinearRing")
        coord_list = " ".join([f"{lo},{la},100" for la, lo in coords])
        ET.SubElement(lr, "coordinates").text = coord_list

    def build_membrane(self, filename: str):
        tree = ET.ElementTree(self.root)
        with open(filename, "wb") as f:
            tree.write(f, encoding="utf-8", xml_declaration=True)
        print(f"✅ KML Membrane materialized: {filename}")

def test_kml_v01():
    print("🌐 Testing Resonant KML v67.1...")
    gen = KMLGenerator("Σ-Resonant Test", "Testing 4D focus.")
    
    # Polar Star View
    gen.set_view(46.6, 32.6, 1000, heading=45, tilt=45)
    
    # Resonant Placemark with orientation
    gen.add_placemark("Resonance-Alpha", 46.63, 32.61, 500, heading=90, tilt=20)
    
    gen.build_membrane("output.kml")

if __name__ == "__main__":
    test_kml_v01()
