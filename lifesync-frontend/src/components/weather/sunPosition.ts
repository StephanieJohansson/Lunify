const radians = Math.PI / 180;

function normalizeDegrees(value: number) {
    return ((value % 360) + 360) % 360;
}

export function isNightAt(latitude: number, longitude: number, date = new Date()) {
    const julianDay = date.getTime() / 86_400_000 + 2_440_587.5;
    const daysSinceJ2000 = julianDay - 2_451_545;
    const meanLongitude = normalizeDegrees(280.46 + 0.9856474 * daysSinceJ2000);
    const meanAnomaly = normalizeDegrees(357.528 + 0.9856003 * daysSinceJ2000) * radians;
    const eclipticLongitude = (
        meanLongitude + 1.915 * Math.sin(meanAnomaly) + 0.02 * Math.sin(2 * meanAnomaly)
    ) * radians;
    const obliquity = (23.439 - 0.0000004 * daysSinceJ2000) * radians;
    const rightAscension = Math.atan2(
        Math.cos(obliquity) * Math.sin(eclipticLongitude),
        Math.cos(eclipticLongitude)
    );
    const declination = Math.asin(Math.sin(obliquity) * Math.sin(eclipticLongitude));
    const siderealTime = normalizeDegrees(
        280.46061837 + 360.98564736629 * daysSinceJ2000 + longitude
    ) * radians;
    const hourAngle = siderealTime - rightAscension;
    const latitudeRadians = latitude * radians;
    const altitude = Math.asin(
        Math.sin(latitudeRadians) * Math.sin(declination)
        + Math.cos(latitudeRadians) * Math.cos(declination) * Math.cos(hourAngle)
    );

    // The sun's upper edge is below the horizon at -0.833 degrees.
    return altitude / radians < -0.833;
}
