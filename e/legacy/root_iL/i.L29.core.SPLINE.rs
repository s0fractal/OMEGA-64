
// Mocking Vector3 for independent compilation
#[derive(Debug, Clone, Copy)]
pub struct Vector3 {
    pub x: f64,
    pub y: f64,
    pub z: f64,
}

impl Vector3 {
    pub fn new(x: f64, y: f64, z: f64) -> Self {
        Vector3 { x, y, z }
    }
}

pub struct Spline;

impl Spline {
    /// Linear Interpolation (Lerp)
    /// t is between 0.0 and 1.0
    pub fn lerp(start: &Vector3, end: &Vector3, t: f64) -> Vector3 {
        let t = t.clamp(0.0, 1.0);
        Vector3 {
            x: start.x + (end.x - start.x) * t,
            y: start.y + (end.y - start.y) * t,
            z: start.z + (end.z - start.z) * t,
        }
    }

    /// Bezier Curve (Quadratic)
    /// Control point pulls the curve
    pub fn bezier(start: &Vector3, control: &Vector3, end: &Vector3, t: f64) -> Vector3 {
        let t = t.clamp(0.0, 1.0);
        let l1 = Spline::lerp(start, control, t);
        let l2 = Spline::lerp(control, end, t);
        Spline::lerp(&l1, &l2, t)
    }
}

pub struct Path {
    pub points: Vec<Vector3>,
}

impl Path {
    pub fn new() -> Self {
        Path { points: Vec::new() }
    }

    pub fn add_point(&mut self, p: Vector3) {
        self.points.push(p);
    }
}
