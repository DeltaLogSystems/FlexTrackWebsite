// Scene setup
const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0x404040, 10, 100);
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.01,
  1000
);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.shadowMap.enabled = true;
renderer.setClearColor(0xd3d3d3);
document.getElementById("hero-section").appendChild(renderer.domElement);

// Camera controls
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.1;
controls.minDistance = 15.3;
controls.maxDistance = 15.3;
controls.maxPolarAngle = Math.PI / 2.3;
controls.minPolarAngle = 0;
controls.enableZoom = false; // Disable zooming
controls.enablePan = false; // Optional: Disable panning to keep focus on rotation only
controls.enableRotate = true; // Explicitly enable rotation

// Curtain rod material
const rodMaterial = new THREE.MeshPhysicalMaterial({
  color: 0xc9b037,
  metalness: 0.8,
  roughness: 0.2,
});

const curtainMaterial = new THREE.MeshPhysicalMaterial({
  color: 0x87ceeb, // Sky blue
  transparent: true,
  opacity: 0.9,
  roughness: 0.8,
  metalness: 0.1,
  side: THREE.DoubleSide,
});

// Room creation function
function createTileTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext("2d");
  const tileSize = 64;

  for (let x = 0; x < 8; x++) {
    for (let y = 0; y < 8; y++) {
      const color = (x + y) % 2 === 0 ? "#dddddd" : "#bbbbbb";
      ctx.fillStyle = color;
      ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
      ctx.strokeStyle = "#999";
      ctx.lineWidth = 2;
      ctx.strokeRect(x * tileSize, y * tileSize, tileSize, tileSize);
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(4, 4);
  return texture;
}

function createRoom() {
  const group = new THREE.Group();
  const height = 12;
  const size = 30;

  const wallMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const ceilingMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const floorMaterial = new THREE.MeshBasicMaterial({
    map: createTileTexture(),
    side: THREE.DoubleSide,
  });

  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(size, size),
    floorMaterial
  );
  floor.rotation.x = -Math.PI / 2;
  group.add(floor);

  const ceiling = new THREE.Mesh(
    new THREE.PlaneGeometry(size, size),
    ceilingMaterial
  );
  ceiling.position.y = height;
  ceiling.rotation.x = Math.PI / 2;
  group.add(ceiling);

  const wallGeo = new THREE.PlaneGeometry(size, height);

  const backWall = new THREE.Mesh(wallGeo, wallMaterial);
  backWall.position.set(0, height / 2, -size / 2);
  group.add(backWall);

  const frontWall = new THREE.Mesh(wallGeo, wallMaterial);
  frontWall.position.set(0, height / 2, size / 2);
  frontWall.rotation.y = Math.PI;
  group.add(frontWall);

  const leftWall = new THREE.Mesh(wallGeo, wallMaterial);
  leftWall.position.set(-size / 2, height / 2, 0);
  leftWall.rotation.y = Math.PI / 2;
  group.add(leftWall);

  const rightWall = new THREE.Mesh(wallGeo, wallMaterial);
  rightWall.position.set(size / 2, height / 2, 0);
  rightWall.rotation.y = -Math.PI / 2;
  group.add(rightWall);

  scene.add(group);
}

function createPhotoFrame(x, y, z, rotationY, imagePath) {
  const frameGroup = new THREE.Group();
  const frameWidth = 12;
  const frameHeight = 6;
  const frameThickness = 0.3;

  const frameGeometry = new THREE.BoxGeometry(
    frameWidth,
    frameHeight,
    frameThickness
  );
  const frameMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
  const frameMesh = new THREE.Mesh(frameGeometry, frameMaterial);
  frameGroup.add(frameMesh);

  const textureLoader = new THREE.TextureLoader();
  textureLoader.load(
    imagePath,
    (texture) => {
      texture.minFilter = THREE.LinearFilter;

      const imagePlane = new THREE.Mesh(
        new THREE.PlaneGeometry(frameWidth - 0.4, frameHeight - 0.4),
        new THREE.MeshBasicMaterial({
          map: texture,
          transparent: false,
          polygonOffset: true,
          polygonOffsetFactor: -1,
          polygonOffsetUnits: -4,
        })
      );

      imagePlane.position.z = frameThickness / 2 + 0.1;
      frameGroup.add(imagePlane);
    },
    undefined,
    (error) => {
      console.error("Error loading texture:", error);
    }
  );

  frameGroup.position.set(x, y, z);
  frameGroup.rotation.y = rotationY;
  scene.add(frameGroup);
}

// Lighting
const ambientLight = new THREE.AmbientLight(0xf5f5f5, 1.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
directionalLight.position.set(-15, 12, 5);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.width = 512;
directionalLight.shadow.mapSize.height = 512;
directionalLight.shadow.camera.left = -10;
directionalLight.shadow.camera.right = 10;
directionalLight.shadow.camera.top = 10;
directionalLight.shadow.camera.bottom = -10;
directionalLight.target.position.set(20, 0, 0);
scene.add(directionalLight);
scene.add(directionalLight.target);

// Materials
const conveyorMaterial = new THREE.MeshStandardMaterial({
  color: 0x006400,
  metalness: 0.2,
  roughness: 0.8,
});
const conveyorTexture = new THREE.TextureLoader().load(
  "data:image/png;base64,Beltimage"
);
conveyorTexture.wrapS = conveyorTexture.wrapT = THREE.RepeatWrapping;
conveyorTexture.repeat.set(4, 1);
conveyorMaterial.map = conveyorTexture;

const structureMaterial = new THREE.MeshStandardMaterial({
  color: 0x808080,
  metalness: 0.6,
  roughness: 0.5,
});

const supportMaterial = new THREE.MeshStandardMaterial({
  color: 0x4a4a4a,
  metalness: 0.7,
  roughness: 0.3,
});

const compartmentMaterial = new THREE.MeshPhysicalMaterial({
  color: 0x2c3e50,
  metalness: 0.8,
  roughness: 0.2,
});

const innerGrayMaterial = new THREE.MeshPhysicalMaterial({
  color: 0x808080,
  metalness: 0.8,
  roughness: 0.2,
});

// Conveyor belts
const conveyorGeometry = new THREE.BoxGeometry(14, 0.2, 2);

const belt1 = new THREE.Mesh(conveyorGeometry, conveyorMaterial);
belt1.position.set(0, 1.1, -8);
scene.add(belt1);

const belt2 = new THREE.Mesh(conveyorGeometry, conveyorMaterial);
belt2.position.set(8, 1.1, 0);
belt2.rotation.y = Math.PI / 2;
scene.add(belt2);

const belt3 = new THREE.Mesh(conveyorGeometry, conveyorMaterial);
belt3.position.set(0, 1.1, 8);
scene.add(belt3);

// Side railings
const railingGeometry = new THREE.BoxGeometry(14, 0.3, 0.1);

const belt1LeftRailing = new THREE.Mesh(railingGeometry, structureMaterial);
belt1LeftRailing.position.set(0, 1.35, -9.05);
scene.add(belt1LeftRailing);
const belt1RightRailing = new THREE.Mesh(railingGeometry, structureMaterial);
belt1RightRailing.position.set(0, 1.35, -6.95);
scene.add(belt1RightRailing);

const belt2LeftRailing = new THREE.Mesh(railingGeometry, structureMaterial);
belt2LeftRailing.position.set(9.05, 1.35, 0);
belt2LeftRailing.rotation.y = Math.PI / 2;
scene.add(belt2LeftRailing);
const belt2RightRailing = new THREE.Mesh(railingGeometry, structureMaterial);
belt2RightRailing.position.set(6.95, 1.35, 0);
belt2RightRailing.rotation.y = Math.PI / 2;
scene.add(belt2RightRailing);

const belt3LeftRailing = new THREE.Mesh(railingGeometry, structureMaterial);
belt3LeftRailing.position.set(0, 1.35, 9.05);
scene.add(belt3LeftRailing);
const belt3RightRailing = new THREE.Mesh(railingGeometry, structureMaterial);
belt3RightRailing.position.set(0, 1.35, 6.95);
scene.add(belt3RightRailing);

// Side support plates
const sidePlateGeometry = new THREE.BoxGeometry(14, 0.8, 0.1);

const belt1LeftPlate = new THREE.Mesh(sidePlateGeometry, structureMaterial);
belt1LeftPlate.position.set(0, 0.6, -9.05);
scene.add(belt1LeftPlate);
const belt1RightPlate = new THREE.Mesh(sidePlateGeometry, structureMaterial);
belt1RightPlate.position.set(0, 0.6, -6.95);
scene.add(belt1RightPlate);

const belt2LeftPlate = new THREE.Mesh(sidePlateGeometry, structureMaterial);
belt2LeftPlate.position.set(9.05, 0.6, 0);
belt2LeftPlate.rotation.y = Math.PI / 2;
scene.add(belt2LeftPlate);
const belt2RightPlate = new THREE.Mesh(sidePlateGeometry, structureMaterial);
belt2RightPlate.position.set(6.95, 0.6, 0);
belt2RightPlate.rotation.y = Math.PI / 2;
scene.add(belt2RightPlate);

const belt3LeftPlate = new THREE.Mesh(sidePlateGeometry, structureMaterial);
belt3LeftPlate.position.set(0, 0.6, 9.05);
scene.add(belt3LeftPlate);
const belt3RightPlate = new THREE.Mesh(sidePlateGeometry, structureMaterial);
belt3RightPlate.position.set(0, 0.6, 6.95);
scene.add(belt3RightPlate);

// Rollers
const rollerGeometry = new THREE.CylinderGeometry(0.05, 0.05, 2, 32);
const rollerPositions = [-6, -4, -2, 0, 2, 4, 6];

rollerPositions.forEach((x) => {
  const roller = new THREE.Mesh(rollerGeometry, structureMaterial);
  roller.position.set(x, 1, -8);
  roller.rotation.x = Math.PI / 2;
  scene.add(roller);
});

rollerPositions.forEach((z) => {
  const roller = new THREE.Mesh(rollerGeometry, structureMaterial);
  roller.position.set(8, 1, z);
  roller.rotation.z = Math.PI / 2;
  scene.add(roller);
});

rollerPositions.forEach((x) => {
  const roller = new THREE.Mesh(rollerGeometry, structureMaterial);
  roller.position.set(x, 1, 8);
  roller.rotation.x = Math.PI / 2;
  scene.add(roller);
});

// Conveyor legs
const legGeometry = new THREE.BoxGeometry(0.2, 1, 0.2);
const legPositions = [-6, -2, 2, 6];

legPositions.forEach((x) => {
  const leg1 = new THREE.Mesh(legGeometry, structureMaterial);
  leg1.position.set(x, 0.5, -8.9);
  scene.add(leg1);
  const leg2 = new THREE.Mesh(legGeometry, structureMaterial);
  leg2.position.set(x, 0.5, -7.1);
  scene.add(leg2);
});

legPositions.forEach((z) => {
  const leg1 = new THREE.Mesh(legGeometry, structureMaterial);
  leg1.position.set(8.9, 0.5, z);
  scene.add(leg1);
  const leg2 = new THREE.Mesh(legGeometry, structureMaterial);
  leg2.position.set(7.1, 0.5, z);
  scene.add(leg2);
});

legPositions.forEach((x) => {
  const leg1 = new THREE.Mesh(legGeometry, structureMaterial);
  leg1.position.set(x, 0.5, 8.9);
  scene.add(leg1);
  const leg2 = new THREE.Mesh(legGeometry, structureMaterial);
  leg2.position.set(x, 0.5, 7.1);
  scene.add(leg2);
});

// Materials for compartments
const metalMaterial = new THREE.MeshPhysicalMaterial({
  color: 0x2c3e50,
  metalness: 0.8,
  roughness: 0.2,
});

const frameMaterial = new THREE.MeshPhysicalMaterial({
  color: 0x34495e,
  metalness: 0.7,
  roughness: 0.3,
});

const doorMaterial = new THREE.MeshPhysicalMaterial({
  color: 0x3498db,
  metalness: 0.6,
  roughness: 0.4,
});

const glassMaterial = new THREE.MeshPhysicalMaterial({
  color: 0xffffff,
  transparent: true,
  opacity: 0.3,
  transmission: 0.9,
  thickness: 0.1,
  roughness: 0.1,
  metalness: 0.0,
});

// Original compartment creation function for corners 1, 2
// Original compartment creation function for corners 1, 2, 3
function createCurtainGeometry(width, height, segments = 20) {
  const geometry = new THREE.PlaneGeometry(width, height, segments, segments);
  const positions = geometry.attributes.position;

  // Add some natural draping to the curtain
  for (let i = 0; i < positions.count; i++) {
    const x = positions.getX(i);
    const y = positions.getY(i);

    // Add subtle wave effect
    const wave = Math.sin(x * 3) * 0.02;
    positions.setZ(i, wave);

    // Add slight gathering at the top
    if (y > height * 0.3) {
      const gatherEffect = (y - height * 0.3) / (height * 0.7);
      positions.setZ(i, positions.getZ(i) + gatherEffect * 0.05);
    }
  }

  geometry.attributes.position.needsUpdate = true;
  geometry.computeVertexNormals();
  return geometry;
}

// Create curtain with rod
function createCurtain(width, height, position, rotation = 0) {
  const curtainGroup = new THREE.Group();

  // Curtain rod
  const rodGeometry = new THREE.CylinderGeometry(0.02, 0.02, width + 0.4, 8);
  const rod = new THREE.Mesh(rodGeometry, rodMaterial);
  rod.rotation.z = Math.PI / 2;
  rod.position.set(0, height / 2 + 0.1, 0.06);
  rod.castShadow = true;
  curtainGroup.add(rod);

  // Rod brackets
  const bracketGeometry = new THREE.BoxGeometry(0.05, 0.05, 0.1);
  const leftBracket = new THREE.Mesh(bracketGeometry, rodMaterial);
  leftBracket.position.set(-width / 2 - 0.15, height / 2 + 0.1, 0.06);
  leftBracket.castShadow = true;

  const rightBracket = new THREE.Mesh(bracketGeometry, rodMaterial);
  rightBracket.position.set(width / 2 + 0.15, height / 2 + 0.1, 0.06);
  rightBracket.castShadow = true;

  curtainGroup.add(leftBracket, rightBracket);

  // Left curtain panel
  const leftCurtainGeometry = createCurtainGeometry(width / 2, height);
  const leftCurtain = new THREE.Mesh(leftCurtainGeometry, curtainMaterial);
  leftCurtain.position.set(-width / 4, 0, 0);
  leftCurtain.castShadow = true;
  leftCurtain.receiveShadow = true;

  // Right curtain panel
  const rightCurtainGeometry = createCurtainGeometry(width / 2, height);
  const rightCurtain = new THREE.Mesh(rightCurtainGeometry, curtainMaterial);
  rightCurtain.position.set(width / 4, 0, 0);
  rightCurtain.castShadow = true;
  rightCurtain.receiveShadow = true;

  curtainGroup.add(leftCurtain, rightCurtain);

  curtainGroup.position.set(position.x, position.y, position.z);
  curtainGroup.rotation.y = rotation;

  curtainGroup.userData = {
    leftPanel: leftCurtain,
    rightPanel: rightCurtain,
    isOpen: false,
    width: width,
  };

  return curtainGroup;
}

// Modified compartment creation function with curtains
function createOriginalCompartment(positionX, positionZ, rotationY) {
  const compartmentGroup = new THREE.Group();

  // Compartment walls
  const walls = [
    { size: [2, 3, 0.1], pos: [0, 1.5, -0.95], castShadow: true }, // back wall
    { size: [0.1, 3, 2], pos: [-0.95, 1.5, 0], castShadow: true }, // left wall
    { size: [2, 0.1, 2], pos: [0, 3, 0], castShadow: true }, // roof
    {
      size: [2, 0.05, 2],
      pos: [0, 0, 0],
      castShadow: true,
      receiveShadow: true,
    }, // floor
  ];

  walls.forEach((wall) => {
    const geometry = new THREE.BoxGeometry(...wall.size);
    const mesh = new THREE.Mesh(geometry, metalMaterial);
    mesh.position.set(...wall.pos);
    if (wall.castShadow) mesh.castShadow = true;
    if (wall.receiveShadow) mesh.receiveShadow = true;
    compartmentGroup.add(mesh);
  });

  // Door frame dimensions
  const doorHeight = 1.9;
  const doorY = 2.05;

  const openingFrameTop = new THREE.BoxGeometry(1.6, 0.15, 0.1);
  const openingFrameLeft = new THREE.BoxGeometry(0.15, doorHeight, 0.1);
  const openingFrameRight = new THREE.BoxGeometry(0.15, doorHeight, 0.1);

  // Entry Door Frame - Front side (Z = +1)
  const frameTopEntry = new THREE.Mesh(openingFrameTop, frameMaterial);
  frameTopEntry.position.set(0, 3, 1);
  frameTopEntry.castShadow = true;

  const frameLeftEntry = new THREE.Mesh(openingFrameLeft, frameMaterial);
  frameLeftEntry.position.set(-0.8, doorY, 1);
  frameLeftEntry.castShadow = true;

  const frameRightEntry = new THREE.Mesh(openingFrameRight, frameMaterial);
  frameRightEntry.position.set(0.8, doorY, 1);
  frameRightEntry.castShadow = true;

  compartmentGroup.add(frameTopEntry, frameLeftEntry, frameRightEntry);

  // Exit Door Frame - Right side (X = +1)
  const frameTopExit = new THREE.Mesh(openingFrameTop, frameMaterial);
  frameTopExit.rotation.y = Math.PI / 2;
  frameTopExit.position.set(1, 3, 0);
  frameTopExit.castShadow = true;

  const frameLeftExit = new THREE.Mesh(openingFrameLeft, frameMaterial);
  frameLeftExit.rotation.y = Math.PI / 2;
  frameLeftExit.position.set(1, doorY, -0.8);
  frameLeftExit.castShadow = true;

  const frameRightExit = new THREE.Mesh(openingFrameRight, frameMaterial);
  frameRightExit.rotation.y = Math.PI / 2;
  frameRightExit.position.set(1, doorY, 0.8);
  frameRightExit.castShadow = true;

  compartmentGroup.add(frameTopExit, frameLeftExit, frameRightExit);

  // Create curtains instead of doors
  const entryCurtain = createCurtain(
    1.6,
    doorHeight,
    { x: 0, y: doorY, z: 0.95 },
    0
  );
  const exitCurtain = createCurtain(
    1.6,
    doorHeight,
    { x: 0.95, y: doorY, z: 0 },
    Math.PI / 2
  );

  compartmentGroup.add(entryCurtain, exitCurtain);

  compartmentGroup.position.set(positionX, 0, positionZ);
  compartmentGroup.rotation.y = rotationY;
  compartmentGroup.userData = {
    entryCurtain: entryCurtain,
    exitCurtain: exitCurtain,
  };

  return compartmentGroup;
}

// C-shaped compartment for corners 3, 4
function createCShapedCompartment(positionX, positionZ, rotationY) {
  const compartmentGroup = new THREE.Group();

  const leftWallGeometry = new THREE.BoxGeometry(0.3, 3, 1.5);
  const leftWallMaterials = [
    innerGrayMaterial,
    compartmentMaterial,
    compartmentMaterial,
    compartmentMaterial,
    compartmentMaterial,
    compartmentMaterial,
  ];
  const leftWall = new THREE.Mesh(leftWallGeometry, leftWallMaterials);
  leftWall.position.set(-1.5, 1.5, 0.25);
  leftWall.castShadow = true;
  compartmentGroup.add(leftWall);

  const rightWall = new THREE.Mesh(leftWallGeometry, [
    compartmentMaterial,
    innerGrayMaterial,
    compartmentMaterial,
    compartmentMaterial,
    compartmentMaterial,
    compartmentMaterial,
  ]);
  rightWall.position.set(1.5, 1.5, 0.25);
  rightWall.castShadow = true;
  compartmentGroup.add(rightWall);

  const topWallGeometry = new THREE.BoxGeometry(3.6, 0.3, 1.5);
  const topWall = new THREE.Mesh(topWallGeometry, [
    compartmentMaterial,
    compartmentMaterial,
    compartmentMaterial,
    innerGrayMaterial,
    compartmentMaterial,
    compartmentMaterial,
  ]);
  topWall.position.set(0, 3.15, 0.25);
  topWall.castShadow = true;
  compartmentGroup.add(topWall);

  const backWallGeometry = new THREE.BoxGeometry(3, 3, 0.1);
  const backWall = new THREE.Mesh(backWallGeometry, [
    compartmentMaterial,
    compartmentMaterial,
    compartmentMaterial,
    compartmentMaterial,
    compartmentMaterial,
    innerGrayMaterial,
  ]);
  backWall.position.set(0, 1.5, 0.9);
  backWall.castShadow = true;
  compartmentGroup.add(backWall);

  const curtainWidth = 3.0;
  const curtainHeight = 3.0;
  const curtainSegments = 32;

  const curtainGeometry = new THREE.PlaneGeometry(
    curtainWidth,
    curtainHeight,
    curtainSegments,
    curtainSegments
  );

  const vertices = curtainGeometry.attributes.position.array;
  for (let i = 0; i < vertices.length; i += 3) {
    const x = vertices[i];
    const y = vertices[i + 1];
    const fold1 =
      Math.sin(x * 3.0) * 0.1 * (1 - (y + curtainHeight / 2) / curtainHeight);
    const fold2 =
      Math.sin(x * 8.0) * 0.03 * (1 - (y + curtainHeight / 2) / curtainHeight);
    const sag =
      -Math.pow(x / (curtainWidth * 0.5), 2) *
      0.15 *
      (1 - (y + curtainHeight / 2) / curtainHeight);
    vertices[i + 2] = fold1 + fold2 + sag;
  }

  curtainGeometry.attributes.position.needsUpdate = true;
  curtainGeometry.computeVertexNormals();

  const curtainMaterial = new THREE.MeshStandardMaterial({
    color: 0x8b7355,
    roughness: 0.8,
    metalness: 0.1,
    transparent: true,
    opacity: 0.85,
    side: THREE.DoubleSide,
    flatShading: false,
  });

  const curtain = new THREE.Mesh(curtainGeometry, curtainMaterial);
  curtain.position.set(0, 1.5, -0.4);
  curtain.castShadow = true;
  curtain.receiveShadow = true;
  compartmentGroup.add(curtain);

  const curtainRodGeometry = new THREE.CylinderGeometry(
    0.02,
    0.02,
    curtainWidth + 0.4,
    8
  );
  const curtainRod = new THREE.Mesh(
    curtainRodGeometry,
    new THREE.MeshStandardMaterial({
      color: 0x444444,
      metalness: 0.7,
      roughness: 0.3,
    })
  );
  curtainRod.position.set(0, 3.0, -0.4);
  curtainRod.rotation.z = Math.PI / 2;
  curtainRod.castShadow = true;
  compartmentGroup.add(curtainRod);

  for (let i = -1.2; i <= 1.2; i += 0.4) {
    const ringGeometry = new THREE.TorusGeometry(0.04, 0.01, 6, 12);
    const ring = new THREE.Mesh(
      ringGeometry,
      new THREE.MeshStandardMaterial({
        color: 0x666666,
        metalness: 0.6,
        roughness: 0.4,
      })
    );
    ring.position.set(i, 3.0, -0.4);
    ring.rotation.x = Math.PI / 2;
    compartmentGroup.add(ring);
  }

  const lightFixtureGeometry = new THREE.BoxGeometry(2.5, 0.1, 0.5);
  const lightFixture = new THREE.Mesh(
    lightFixtureGeometry,
    new THREE.MeshLambertMaterial({ color: 0xffffcc })
  );
  lightFixture.position.set(0, 2.9, 0.25);
  compartmentGroup.add(lightFixture);

  const lightHousingGeometry = new THREE.CylinderGeometry(0.25, 0.25, 0.1, 16);
  const lightHousing = new THREE.Mesh(
    lightHousingGeometry,
    new THREE.MeshLambertMaterial({ color: 0x222222 })
  );
  lightHousing.position.set(0, 3.2, 0.25);
  compartmentGroup.add(lightHousing);

  const redLightGeometry = new THREE.SphereGeometry(
    0.2,
    16,
    8,
    0,
    Math.PI * 2,
    0,
    Math.PI / 2
  );
  const redLightMaterial = new THREE.MeshLambertMaterial({
    color: 0xff2222,
    emissive: 0x440000,
    transparent: true,
    opacity: 0.9,
  });
  const redLight = new THREE.Mesh(redLightGeometry, redLightMaterial);
  redLight.position.set(0, 3.3, 0.25);
  compartmentGroup.add(redLight);

  const lightCoreGeometry = new THREE.SphereGeometry(
    0.15,
    12,
    6,
    0,
    Math.PI * 2,
    0,
    Math.PI / 2
  );
  const lightCore = new THREE.Mesh(
    lightCoreGeometry,
    new THREE.MeshLambertMaterial({
      color: 0xff6666,
      emissive: 0x880000,
    })
  );
  lightCore.position.set(0, 3.31, 0.25);
  compartmentGroup.add(lightCore);

  const indicatorPanelGeometry = new THREE.BoxGeometry(0.1, 0.8, 0.4);
  const indicatorPanel = new THREE.Mesh(
    indicatorPanelGeometry,
    new THREE.MeshLambertMaterial({ color: 0x333333 })
  );
  indicatorPanel.position.set(1.65, 2.2, -0.05);
  compartmentGroup.add(indicatorPanel);

  const statusLightGeometry = new THREE.SphereGeometry(0.08, 8, 8);
  const statusLight = new THREE.Mesh(
    statusLightGeometry,
    new THREE.MeshLambertMaterial({ color: 0x00ff00 })
  );
  statusLight.position.set(1.7, 2.4, -0.05);
  compartmentGroup.add(statusLight);

  const controlButtonGeometry = new THREE.CylinderGeometry(0.06, 0.06, 0.05, 8);
  const controlButton = new THREE.Mesh(
    controlButtonGeometry,
    new THREE.MeshLambertMaterial({ color: 0x0066cc })
  );
  controlButton.position.set(1.7, 2.0, -0.05);
  controlButton.rotation.z = Math.PI / 2;
  compartmentGroup.add(controlButton);

  const textMesh = createTextPlane("IN PRODUCTION", 0, 2.5, -0.05);
  textMesh.rotation.y = 0;
  compartmentGroup.add(textMesh);

  compartmentGroup.userData = {
    entryDoor: null,
    exitDoor: null,
    isEntryOpen: false,
    isExitOpen: false,
    curtain: curtain,
  };

  compartmentGroup.position.set(positionX, 0, positionZ);
  compartmentGroup.rotation.y = rotationY;

  return compartmentGroup;
}

function createTextPlane(text, x, y, z) {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  canvas.width = 512;
  canvas.height = 128;

  context.fillStyle = "rgba(50, 50, 50, 0.9)";
  context.fillRect(0, 0, canvas.width, canvas.height);

  context.fillStyle = "#ffffff";
  context.font = "bold 28px Arial";
  context.textAlign = "center";
  context.fillText(text, canvas.width / 2, canvas.height / 2 + 8);

  const texture = new THREE.CanvasTexture(canvas);
  const material = new THREE.MeshBasicMaterial({
    map: texture,
    transparent: true,
  });
  const geometry = new THREE.PlaneGeometry(2.5, 0.4);
  const textMesh = new THREE.Mesh(geometry, material);
  textMesh.position.set(x, y, z);
  return textMesh;
}

// Create compartments
const corner1Compartment = createOriginalCompartment(8, -8, -Math.PI / 2);
const corner2Compartment = createOriginalCompartment(8, 8, Math.PI);
const corner3Compartment = createCShapedCompartment(-7.5, 8, (3 * Math.PI) / 2);
const corner4Compartment = createCShapedCompartment(-7.5, -8, -Math.PI / 2);
scene.add(
  corner1Compartment,
  corner2Compartment,
  corner3Compartment,
  corner4Compartment
);

const compartments = [
  corner1Compartment,
  corner2Compartment,
  corner3Compartment,
  corner4Compartment,
];

function toggleDoor(compartmentIndex, doorType) {
  const compartment = compartments[compartmentIndex];
  const door =
    doorType === "entry"
      ? compartment.userData.entryDoor
      : compartment.userData.exitDoor;

  if (!door) {
    if (doorType === "entry") {
      compartment.userData.isEntryOpen = !compartment.userData.isEntryOpen;
    } else {
      compartment.userData.isExitOpen = !compartment.userData.isExitOpen;
    }
    return;
  }

  const isOpen =
    doorType === "entry"
      ? compartment.userData.isEntryOpen
      : compartment.userData.isExitOpen;
  const doorY = 2.05;
  const doorHeight = 1.9;
  const targetY = isOpen ? doorY : doorY + doorHeight;
  const duration = 800;
  const startY = door.position.y;
  const startTime = Date.now();

  function animateDoor() {
    const elapsed = Date.now() - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    door.position.y = startY + (targetY - startY) * eased;

    if (progress < 1) {
      requestAnimationFrame(animateDoor);
    } else {
      if (doorType === "entry") {
        compartment.userData.isEntryOpen = !isOpen;
      } else {
        compartment.userData.isExitOpen = !isOpen;
      }
    }
  }

  animateDoor();
}

function createWaterBottle() {
  const bottleGroup = new THREE.Group();
  const bodyGeometry = new THREE.CylinderGeometry(0.35, 0.4, 2, 16);
  const bodyMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.3,
    roughness: 0.1,
    metalness: 0.0,
    transmission: 0.9,
    thickness: 0.1,
  });

  const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
  body.castShadow = true;
  body.receiveShadow = true;

  const capGeometry = new THREE.CylinderGeometry(0.25, 0.3, 0.3, 12);
  const capMaterial = new THREE.MeshPhongMaterial({
    color: 0x2980b9,
    shininess: 50,
  });

  const cap = new THREE.Mesh(capGeometry, capMaterial);
  cap.position.y = 1.15;
  cap.castShadow = true;

  for (let i = 0; i < 8; i++) {
    const ridgeGeometry = new THREE.TorusGeometry(0.28, 0.02, 4, 8);
    const ridgeMaterial = new THREE.MeshPhongMaterial({ color: 0x1f5f8b });
    const ridge = new THREE.Mesh(ridgeGeometry, ridgeMaterial);
    ridge.position.y = 1.15 - i * 0.03;
    ridge.rotation.x = Math.PI / 2;
    bottleGroup.add(ridge);
  }

  const waterGeometry = new THREE.CylinderGeometry(0.32, 0.37, 1.5, 16);
  const waterMaterial = new THREE.MeshPhysicalMaterial({
    color: 0x87ceeb,
    transparent: true,
    opacity: 0.6,
    roughness: 0.0,
    metalness: 0.0,
  });

  const water = new THREE.Mesh(waterGeometry, waterMaterial);
  water.position.y = -0.25;

  const labelGeometry = new THREE.CylinderGeometry(
    0.405,
    0.405,
    0.8,
    32,
    1,
    true
  );
  const textureLoader = new THREE.TextureLoader();
  const labelMaterial = new THREE.MeshBasicMaterial({
    map: textureLoader.load("./assets/img/room/front_wall.png"),
    transparent: true,
    opacity: 0.9,
    side: THREE.DoubleSide,
  });

  const label = new THREE.Mesh(labelGeometry, labelMaterial);
  label.position.y = 0.1;

  bottleGroup.add(body, cap, water, label);
  bottleGroup.position.y = 1.4;

  return bottleGroup;
}

function createCardboardTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "#D2B48C";
  ctx.fillRect(0, 0, 512, 512);

  ctx.strokeStyle = "rgba(139, 69, 19, 0.3)";
  ctx.lineWidth = 1;
  for (let i = 0; i < 20; i++) {
    ctx.beginPath();
    ctx.moveTo(0, i * 25 + Math.random() * 10);
    ctx.lineTo(512, i * 25 + Math.random() * 10);
    ctx.stroke();
  }

  for (let i = 0; i < 20; i++) {
    ctx.beginPath();
    ctx.moveTo(i * 25 + Math.random() * 10, 0);
    ctx.lineTo(i * 25 + Math.random() * 10, 512);
    ctx.stroke();
  }

  ctx.fillStyle = "rgba(139, 69, 19, 0.1)";
  for (let i = 0; i < 50; i++) {
    const x = Math.random() * 512;
    const y = Math.random() * 512;
    const size = Math.random() * 20 + 5;
    ctx.fillRect(x, y, size, 2);
  }

  return new THREE.CanvasTexture(canvas);
}

function createTapeTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 64;
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "#F4A460";
  ctx.fillRect(0, 0, 256, 64);

  const gradient = ctx.createLinearGradient(0, 0, 0, 64);
  gradient.addColorStop(0, "rgba(255,255,255,0.3)");
  gradient.addColorStop(0.5, "rgba(255,255,255,0.1)");
  gradient.addColorStop(1, "rgba(255,255,255,0.3)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 256, 64);

  return new THREE.CanvasTexture(canvas);
}

function createPaperBox() {
  const boxGroup = new THREE.Group();
  const scale = 0.5;

  const cardboardTexture = createCardboardTexture();
  cardboardTexture.wrapS = THREE.RepeatWrapping;
  cardboardTexture.wrapT = THREE.RepeatWrapping;
  cardboardTexture.repeat.set(2, 2);

  const boxMaterial = new THREE.MeshLambertMaterial({
    map: cardboardTexture,
    color: 0xd2b48c,
  });

  const tapeTexture = createTapeTexture();
  const tapeMaterial = new THREE.MeshLambertMaterial({
    map: tapeTexture,
    color: 0xf4a460,
  });

  const boxGeometry = new THREE.BoxGeometry(3, 2, 2);
  const box = new THREE.Mesh(boxGeometry, boxMaterial);
  box.castShadow = true;
  box.receiveShadow = true;
  boxGroup.add(box);

  const flapGeometry = new THREE.BoxGeometry(3.1, 0.05, 1);
  const topFlap1 = new THREE.Mesh(flapGeometry, boxMaterial);
  topFlap1.position.set(0, 1.025, 0.5);
  boxGroup.add(topFlap1);

  const topFlap2 = new THREE.Mesh(flapGeometry, boxMaterial);
  topFlap2.position.set(0, 1.025, -0.5);
  boxGroup.add(topFlap2);

  const sideFlapGeometry = new THREE.BoxGeometry(1, 0.05, 2.1);
  const sideFlap1 = new THREE.Mesh(sideFlapGeometry, boxMaterial);
  sideFlap1.position.set(1.55, 1.025, 0);
  boxGroup.add(sideFlap1);

  const sideFlap2 = new THREE.Mesh(sideFlapGeometry, boxMaterial);
  sideFlap2.position.set(-1.55, 1.025, 0);
  boxGroup.add(sideFlap2);

  const tapeGeometry = new THREE.BoxGeometry(3.2, 0.1, 0.2);
  const tape1 = new THREE.Mesh(tapeGeometry, tapeMaterial);
  tape1.position.set(0, 1.1, 0);
  boxGroup.add(tape1);

  const verticalTapeGeometry = new THREE.BoxGeometry(0.2, 0.1, 2.2);
  const tape2 = new THREE.Mesh(verticalTapeGeometry, tapeMaterial);
  tape2.position.set(0, 1.1, 0);
  boxGroup.add(tape2);

  const textureLoader = new THREE.TextureLoader();
  textureLoader.load(
    "./assets/img/room/front_wall.png",
    function (loadedTexture) {
      const base64Material = new THREE.MeshLambertMaterial({
        map: loadedTexture,
        transparent: true,
      });
      const imagePlane = new THREE.Mesh(
        new THREE.PlaneGeometry(2.5, 1.25),
        base64Material
      );
      imagePlane.position.set(0, 0, 1.01);
      imagePlane.castShadow = true;
      boxGroup.add(imagePlane);
    }
  );

  boxGroup.scale.set(scale, scale, scale);
  boxGroup.position.y = 1.4;

  return boxGroup;
}

// Initialize bottles and boxes
const maxItems = 3; // Maximum number of bottles and boxes
const bottles = [];
const boxes = [];
const itemCount = 3;

for (let i = 0; i < itemCount; i++) {
  const bottle = createWaterBottle();
  bottle.userData = {
    segment: 0,
    t: i / itemCount,
    type: "bottle",
  };
  bottles.push(bottle);
  scene.add(bottle);
}

for (let i = 0; i < itemCount; i++) {
  const box = createPaperBox();
  box.userData = {
    segment: 1,
    t: i / itemCount,
    type: "box",
  };
  boxes.push(box);
  scene.add(box);
}

let corner1EntryOpen = false;
let corner1ExitOpen = false;
let corner2EntryOpen = false;
let corner2ExitOpen = false;
let corner3EntryOpen = false;
let corner3ExitOpen = false;
let corner4EntryOpen = false;
let corner4ExitOpen = false;

let bottleCountInCorner1 = 0;
let bottleCountInCorner4 = 0;

createRoom();

// Main Wall - Front
createPhotoFrame(-14.9, 6, 0, Math.PI / 2, "../assets/img/room/front_wall.png");

// Opposite Front Wall
createPhotoFrame(
  14.9,
  6,
  0,
  -Math.PI / 2,
  "../assets/img/products/PlasticBelt/shutterstock_1050938969.jpg"
);

// Left Wall
createPhotoFrame(
  0,
  6,
  -14.9,
  0,
  "../assets/img/products/PlasticModularBelt/InCline_Conveyer_Image.png"
);

// Right Wall
createPhotoFrame(
  0,
  6,
  14.9,
  Math.PI,
  "../assets/img/products/Pvc/Industrial Conveyor Belt in Warehouse.png"
);

camera.position.set(990, 500, -10);
camera.lookAt(0, 0, 0);

//const gui = new dat.GUI();
const settings = {
  itemSpeed: 0.02,
};
//gui.add(settings, "itemSpeed", 0.01, 0.1).name("Item Speed");

function animate() {
  requestAnimationFrame(animate);

  conveyorTexture.offset.x -= 0.01;

  // Update bottles
  bottles.forEach((bottle) => {
    let { segment, t } = bottle.userData;
    t += settings.itemSpeed / 14;

    if (segment === 0 && t >= 1) {
      // Bottle reaches corner1
      bottleCountInCorner1++;
      // Reset bottle to start of segment 0 if max not reached
      if (bottles.length <= maxItems) {
        bottle.userData.t = 0;
        bottle.position.x = -8;
        bottle.position.z = -8;
        bottle.position.y = 1.4;
      } else {
        scene.remove(bottle);
        bottles.splice(bottles.indexOf(bottle), 1);
      }

      if (bottleCountInCorner1 >= 2 && boxes.length < maxItems) {
        // Create a new box in segment 1 if under max
        const newBox = createPaperBox();
        newBox.userData = { segment: 1, t: 0, type: "box" };
        newBox.position.set(8, 1.4, -8);
        newBox.rotation.y = Math.PI / 2;
        boxes.push(newBox);
        scene.add(newBox);
        bottleCountInCorner1 = 0;
        if (!corner1ExitOpen) {
          toggleDoor(0, "exit");
          corner1ExitOpen = true;
        }
        if (!corner2EntryOpen) {
          toggleDoor(1, "entry");
          corner2EntryOpen = true;
        }
      }
      return;
    } else if (segment === 3 && t >= 1) {
      // Bottle reaches corner4
      bottleCountInCorner4++;
      // Reset an existing box to segment 1
      const availableBox = boxes.find(
        (b) => b.userData.segment === 3 && b.userData.t >= 1
      );
      if (availableBox && boxes.length <= maxItems) {
        availableBox.userData.segment = 1;
        availableBox.userData.t = 0;
        availableBox.position.set(8, 1.4, -8);
        availableBox.rotation.y = Math.PI / 2;
        if (!corner4ExitOpen) {
          toggleDoor(3, "exit");
          corner4ExitOpen = true;
        }
      }
      // Reset bottle to segment 0
      bottle.userData.t = 0;
      bottle.userData.segment = 0;
      bottle.position.x = -8;
      bottle.position.z = -8;
      bottle.position.y = 1.4;
      return;
    }

    bottle.userData.t = t;
    if (segment === 0) {
      bottle.position.x = -8 + t * 16;
      bottle.position.z = -8;
    } else if (segment === 3) {
      bottle.position.x = -8;
      bottle.position.z = -8 + t * 16;
    }
    bottle.position.y = 1.4;
  });

  // Update boxes
  boxes.forEach((box, index) => {
    let { segment, t } = box.userData;
    t += settings.itemSpeed / 14;

    if (segment === 2 && box.position.x >= -8 && box.position.x <= -7.8) {
      // Box reaches corner3, destroy it
      scene.remove(box);
      boxes.splice(index, 1);
      if (!corner3EntryOpen) {
        toggleDoor(2, "entry");
        corner3EntryOpen = true;
      }
      return;
    }

    if (t >= 1) {
      t = 0;
      segment = segment === 1 ? 2 : 3;
      box.rotation.y += Math.PI / 2;
    }

    box.userData.segment = segment;
    box.userData.t = t;

    if (segment === 1) {
      box.position.x = 8;
      box.position.z = -8 + t * 16;
    } else if (segment === 2) {
      box.position.x = 8 - t * 16;
      box.position.z = 8;
    }
    box.position.y = 1.4;
  });

  // Door control logic
  bottles.forEach((bottle) => {
    if (
      bottle.userData.segment === 0 &&
      bottle.position.x >= 7.8 &&
      bottle.position.x <= 8
    ) {
      if (!corner1EntryOpen) {
        toggleDoor(0, "entry");
        corner1EntryOpen = true;
      }
    } else if (corner1EntryOpen && bottleCountInCorner1 < 2) {
      toggleDoor(0, "entry");
      corner1EntryOpen = false;
    }

    if (
      bottle.userData.segment === 3 &&
      bottle.position.z >= 7.8 &&
      bottle.position.z <= 8
    ) {
      if (!corner4EntryOpen) {
        toggleDoor(3, "entry");
        corner4EntryOpen = true;
      }
    } else if (corner4EntryOpen && bottleCountInCorner4 < 1) {
      toggleDoor(3, "entry");
      corner4EntryOpen = false;
    }
  });

  boxes.forEach((box) => {
    if (
      box.userData.segment === 1 &&
      box.position.z >= -8 &&
      box.position.z <= -7.8
    ) {
      if (!corner1ExitOpen) {
        toggleDoor(0, "exit");
        corner1ExitOpen = true;
      }
    } else if (corner1ExitOpen) {
      toggleDoor(0, "exit");
      corner1ExitOpen = false;
    }

    if (
      box.userData.segment === 1 &&
      box.position.z >= 7.8 &&
      box.position.z <= 8
    ) {
      if (!corner2EntryOpen) {
        toggleDoor(1, "entry");
        corner2EntryOpen = true;
      }
    } else if (corner2EntryOpen) {
      toggleDoor(1, "entry");
      corner2EntryOpen = false;
    }

    if (
      box.userData.segment === 2 &&
      box.position.x >= 7.8 &&
      box.position.x <= 8
    ) {
      if (!corner2ExitOpen) {
        toggleDoor(1, "exit");
        corner2ExitOpen = true;
      }
    } else if (corner2ExitOpen) {
      toggleDoor(1, "exit");
      corner2ExitOpen = false;
    }

    if (
      box.userData.segment === 2 &&
      box.position.x >= -8 &&
      box.position.x <= -7.8
    ) {
      if (!corner3EntryOpen) {
        toggleDoor(2, "entry");
        corner3EntryOpen = true;
      }
    } else if (corner3EntryOpen) {
      toggleDoor(2, "entry");
      corner3EntryOpen = false;
    }
  });

  controls.update();

  renderer.render(scene, camera);
}

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

animate();
