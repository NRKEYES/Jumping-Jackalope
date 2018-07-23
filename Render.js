var COLORS = {
    "H": 0xFCF6B1,
    "C": 0x233D4D,
    "Au": 0xe6e600,
    "Al": 0xcdeb8b,
    "V": 0xff26d4,
    "O": 0xff0000,
    "N": 0x0033cc
};

var atom_radius = {
    "H": .37,
    "C": .77,
    "Au": 1.44,
    "Al": 1.18,
    "V": 1.25,
    "O": .73,
    "N": .75
};

var scene, camera, mesh, pointLight,renderer;
var molecules = [];


function init(){
  renderer = new THREE.WebGLRenderer({alpha: true, antialias: true});
  renderer.setClearColor( 0xffffff,.1 );
  renderer.domElement.style.position = 'absolute';
  renderer.setSize(  width_for_3d,  height_for_3d );


  scene = new THREE.Scene();
  camera = new THREE.OrthographicCamera(width_for_3d  / -2,
                                            width_for_3d / 2,
                                            height_for_3d / 2,
                                            height_for_3d/ - 2,
                                            1, 2000 );
  camera.position.z = 500;

  scene = new THREE.Scene();
  scene.position.x = 0;
  scene.position.y = 0;
  scene.position.z = 0;

  pointLight = new THREE.PointLight( 0xFBFCF6 );
  pointLight.position.x = 500;
  pointLight.position.z = 30
  pointLight.lookAt(scene.position)
  scene.add(pointLight);


  container = document.getElementById('threeD');
  container.appendChild(renderer.domElement);

}






function add_molecule(local_x,local_y, all_data){

  let centerX = +local_x;
  let centerY = +local_y;
  let centerZ = 0;


  let atoms =[];
  let coords = [];
  let mergedGeometry = new THREE.Geometry();
  let materials = [];



  let normalize =new THREE.Vector3(0,0,0)
  let first = true;
  all_data.forEach( function(row){

    let a = row.split(/\b\s+/);
    atoms.push(a[0]);

    if(first){
      first = false;
      normalize = new THREE.Vector3(+a[1],+a[2],+a[3])
    }
    shrink = 15;
    new_coord = (new THREE.Vector3( (+a[1]-normalize.x)*shrink,
                                    (+a[2]-normalize.y)*shrink,
                                    (+a[3]-normalize.z)*shrink))
    coords.push(new_coord);
  })

  var material = null;



  for(var i=0 ; i < coords.length; i++){
      material = new THREE.MeshToonMaterial({  color: COLORS[atoms[i]] ,
                                                          flatShading: false});
      materials.push(material)
      let sphereGeometry = new THREE.SphereGeometry( atom_radius[atoms[i]]*10, 30, 30);
      let sphereMesh = new  THREE.Mesh(sphereGeometry);
      sphereMesh.updateMatrix();
      sphereMesh.geometry.faces.forEach(function(face){face.materialIndex = 0; });

      sphereGeometry.translate(coords[i].x, coords[i].y, coords[i].z);
      mergedGeometry.merge(sphereGeometry,sphereGeometry.matrix, i);
  };
  let mergedMaterial = new THREE.MeshFaceMaterial(materials);

  // TODO add a material combinations so that each otom is colored correctly
  let molecule = new THREE.Mesh(mergedGeometry, mergedMaterial)
  //molecule.geometry.computeFaceNormals();
  //molecule.geometry.computeVertexNormals();


  molecule.position.set(local_x,local_y,0)
  molecules.push(molecule);
  scene.add(molecule);



}

function set_position(){

}



function animate() {
  requestAnimationFrame( animate );
  molecules.forEach(function(mol){
    mol.rotation.x += 0.005;
    mol.rotation.y += 0.005;
    mol.rotation.z += 0.005;
  })
  renderer.render(scene, camera);

}


// Actual functions call to start everything rendering
init();
animate();
