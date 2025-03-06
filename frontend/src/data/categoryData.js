/**
 * Array of ATPL question categories with their metadata
 * Each category contains:
 * - id: Unique identifier for the category (e.g., '010' for Air Law)
 * - title: Display name of the category
 * - description: Brief explanation of the category content
 * - image: Path to the category's illustration image
 * - subcategories: Array of subcategories with their codes and names
 */
const categories = [
  {
    id: '010',
    title: 'Air Law',
    description: 'Aviation laws, regulations and procedures',
    image: '/images/categories/regulations.jpg',
    subcategories: [
      { code: '010-01', name: 'International Law' },
      { code: '010-02', name: 'Airworthiness of Aircraft' },
      { code: '010-03', name: 'Aircraft Nationality and Registration Marks' },
      { code: '010-04', name: 'Personnel Licensing' },
      { code: '010-05', name: 'Rules of the Air' },
      { code: '010-06', name: 'Air Traffic Services and Air Traffic Management' },
      { code: '010-07', name: 'Aerodromes' },
      { code: '010-08', name: 'Facilitation' },
      { code: '010-09', name: 'Search and Rescue' },
      { code: '010-10', name: 'Security' },
      { code: '010-11', name: 'Aircraft Accident Investigation' },
      { code: '010-12', name: 'Air Law - National Law' }
    ]
  },
  {
    id: '021',
    title: 'Airframe and Systems',
    description: 'Aircraft structure, systems, and power plants',
    image: '/images/categories/systems.jpg',
    subcategories: [
      { code: '021-01', name: 'System Design, Loads, Stresses, Maintenance' },
      { code: '021-02', name: 'Airframe' },
      { code: '021-03', name: 'Hydraulics' },
      { code: '021-04', name: 'Landing Gear, Wheels, Tires, Brakes' },
      { code: '021-05', name: 'Flight Controls' },
      { code: '021-06', name: 'Pneumatics - Pressurization and Air Conditioning' },
      { code: '021-07', name: 'Anti and De-icing Systems' },
      { code: '021-08', name: 'Fuel System' },
      { code: '021-09', name: 'Electrics' },
      { code: '021-10', name: 'Piston Engines' },
      { code: '021-11', name: 'Turbine Engines' },
      { code: '021-12', name: 'Protection and Detection Systems' },
      { code: '021-13', name: 'Oxygen Systems' }
    ]
  },
  {
    id: '022',
    title: 'Instrumentation',
    description: 'Aircraft instruments and electronics',
    image: '/images/categories/systems.jpg',
    subcategories: [
      { code: '022-01', name: 'Sensors and Instruments' },
      { code: '022-02', name: 'Measurement of Air Data Parameters' },
      { code: '022-03', name: 'Magnetism - Direct Reading Compass and Flux Valve' },
      { code: '022-04', name: 'Gyroscopic Instruments' },
      { code: '022-05', name: 'Inertial Navigation and Reference Systems' },
      { code: '022-06', name: 'Aircraft Equipment and Systems' },
      { code: '022-07', name: 'Electronic Displays' },
      { code: '022-08', name: 'Servomechanisms' }
    ]
  },
  {
    id: '031',
    title: 'Mass and Balance',
    description: 'Weight, balance, and loading',
    image: '/images/categories/general.jpg',
    subcategories: [
      { code: '031-01', name: 'Purpose of Mass and Balance Considerations' },
      { code: '031-02', name: 'Loading' },
      { code: '031-03', name: 'Fundamentals of CG Calculations' },
      { code: '031-04', name: 'Mass and Balance Details of Aircraft' },
      { code: '031-05', name: 'Determination of CG Position' },
      { code: '031-06', name: 'Cargo Handling' }
    ]
  },
  {
    id: '032',
    title: 'Performance',
    description: 'Aircraft performance and flight planning',
    image: '/images/categories/general.jpg',
    subcategories: [
      { code: '032-01', name: 'General Performance Theory' },
      { code: '032-02', name: 'Performance Class B - Single Engine' },
      { code: '032-03', name: 'Performance Class B - Multi Engine' },
      { code: '032-04', name: 'Performance Class A' }
    ]
  },
  {
    id: '033',
    title: 'Flight Planning',
    description: 'Navigation and route planning',
    image: '/images/categories/navigation.jpg',
    subcategories: [
      { code: '033-01', name: 'Flight Planning for VFR Flights' },
      { code: '033-02', name: 'Flight Planning for IFR Flights' },
      { code: '033-03', name: 'Fuel Planning' },
      { code: '033-04', name: 'Pre-flight Preparation' },
      { code: '033-05', name: 'ATS Flight Plan' }
    ]
  },
  {
    id: '040',
    title: 'Human Performance',
    description: 'Human factors and limitations',
    image: '/images/categories/general.jpg',
    subcategories: [
      { code: '040-01', name: 'Human Factors: Basic Concepts' },
      { code: '040-02', name: 'Basic Aviation Physiology and Health Maintenance' },
      { code: '040-03', name: 'Basic Aviation Psychology' }
    ]
  },
  {
    id: '050',
    title: 'Meteorology',
    description: 'Weather and atmospheric conditions',
    image: '/images/categories/weather.jpg',
    subcategories: [
      { code: '050-01', name: 'The Atmosphere' },
      { code: '050-02', name: 'Wind' },
      { code: '050-03', name: 'Thermodynamics' },
      { code: '050-04', name: 'Clouds and Fog' },
      { code: '050-05', name: 'Precipitation' },
      { code: '050-06', name: 'Air Masses and Fronts' },
      { code: '050-07', name: 'Pressure Systems' },
      { code: '050-08', name: 'Climatology' },
      { code: '050-09', name: 'Flight Hazards' },
      { code: '050-10', name: 'Meteorological Information' }
    ]
  },
  {
    id: '061',
    title: 'General Navigation',
    description: 'Basic navigation principles and methods',
    image: '/images/categories/navigation.jpg',
    subcategories: [
      { code: '061-01', name: 'Basics of Navigation' },
      { code: '061-02', name: 'Magnetism and Compasses' },
      { code: '061-03', name: 'Charts' },
      { code: '061-04', name: 'Dead Reckoning Navigation' },
      { code: '061-05', name: 'In-Flight Navigation' }
    ]
  },
  {
    id: '062',
    title: 'Radio Navigation',
    description: 'Radio navigation systems and procedures',
    image: '/images/categories/navigation.jpg',
    subcategories: [
      { code: '062-01', name: 'Basic Radio Propagation Theory' },
      { code: '062-02', name: 'Radio Aids' },
      { code: '062-03', name: 'Radar' },
      { code: '062-04', name: 'Area Navigation Systems' },
      { code: '062-05', name: 'Satellite Navigation Systems' },
      { code: '062-06', name: 'PBN' }
    ]
  },
  {
    id: '070',
    title: 'Operational Procedures',
    description: 'Standard operating procedures and safety',
    image: '/images/categories/operations.jpg',
    subcategories: [
      { code: '070-01', name: 'General Requirements' },
      { code: '070-02', name: 'Special Operational Procedures and Hazards (General Aspects)' },
      { code: '070-03', name: 'Emergency Procedures' }
    ]
  },
  {
    id: '081',
    title: 'Principles of Flight',
    description: 'Aerodynamics and flight mechanics',
    image: '/images/categories/principles.jpg',
    subcategories: [
      { code: '081-01', name: 'Subsonic Aerodynamics' },
      { code: '081-02', name: 'High Speed Aerodynamics' },
      { code: '081-03', name: 'Types of Aircraft' },
      { code: '081-04', name: 'Flight Mechanics' },
      { code: '081-05', name: 'Flight Stability' },
      { code: '081-06', name: 'Flight Control' },
      { code: '081-07', name: 'Limitations' },
      { code: '081-08', name: 'Propellers' }
    ]
  },
  // ... other categories with their subcategories
];

export default categories;
