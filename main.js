import gsap from "gsap";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import * as dat from "dat.gui";
import { DoubleSide } from "three";

const gui = new dat.GUI();
const world = {
    plane: {
        width: 200,
        height: 200,
        widthSegments: 60,
        heightSegments: 60,
    },
};
gui.add(world.plane, "width", 1, 700).onChange(generatePlane);

gui.add(world.plane, "height", 1, 700).onChange(generatePlane);
gui.add(world.plane, "widthSegments", 1, 60).onChange(generatePlane);
gui.add(world.plane, "heightSegments", 1, 60).onChange(generatePlane);

function generatePlane() {
    planeMesh.geometry.dispose();
    planeMesh.geometry = new THREE.PlaneGeometry(
        world.plane.width,
        world.plane.height,
        world.plane.widthSegments,
        world.plane.heightSegments
    );

    const { array } = planeMesh.geometry.attributes.position;

    const randomValues = [];
    for (let i = 0; i < array.length; i++) {
        if (i % 3 == 0) {
            const x = array[i];
            const y = array[i + 1];
            const z = array[i + 2];
            array[i] = x + (Math.random() - 0.5);
            array[i + 1] = y + (Math.random() - 0.5);
            array[i + 2] = z + (Math.random() - 0.5) * 3;
        }

        randomValues.push(Math.random() - 0.5);
    }

    planeMesh.geometry.attributes.position.originalPosition =
        planeMesh.geometry.attributes.position.array;

    planeMesh.geometry.attributes.position.randomValues = randomValues;
    const colors = [];

    for (let i = 0; i < planeMesh.geometry.attributes.position.count; i++) {
        colors.push(0, 0.19, 0.4);
    }

    planeMesh.geometry.setAttribute(
        "color",
        new THREE.BufferAttribute(new Float32Array(colors), 3)
    );
}

const raycaster = new THREE.Raycaster();

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
    75,
    innerWidth / innerHeight,
    0.1,
    1000
);

camera.position.z = 4;
camera.position.y = -35;
// camera.position.z = 5;

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(innerWidth, innerHeight);
renderer.setPixelRatio(devicePixelRatio);
document.body.appendChild(renderer.domElement);

new OrbitControls(camera, renderer.domElement);

const planeGeometry = new THREE.PlaneGeometry(200, 200, 60, 60);
const material = new THREE.MeshPhongMaterial({
    side: DoubleSide,
    flatShading: true,
    vertexColors: true,
});

const planeMesh = new THREE.Mesh(planeGeometry, material);

const { array } = planeMesh.geometry.attributes.position;

const randomValues = [];
for (let i = 0; i < array.length; i++) {
    if (i % 3 == 0) {
        const x = array[i];
        const y = array[i + 1];
        const z = array[i + 2];
        array[i] = x + (Math.random() - 0.5);
        array[i + 1] = y + (Math.random() - 0.5);
        array[i + 2] = z + (Math.random() - 0.5) * 3;
    }

    randomValues.push(Math.random() - 0.5);
}

planeMesh.geometry.attributes.position.originalPosition =
    planeMesh.geometry.attributes.position.array;

planeMesh.geometry.attributes.position.randomValues = randomValues;

console.log(planeMesh.geometry.attributes.position);

const colors = [];

for (let i = 0; i < planeMesh.geometry.attributes.position.count; i++) {
    colors.push(0, 0.19, 0.4);
}

planeMesh.geometry.setAttribute(
    "color",
    new THREE.BufferAttribute(new Float32Array(colors), 3)
);

scene.add(planeMesh);

const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(0, 0, 2);
scene.add(light);

const mouse = {
    x: undefined,
    y: undefined,
};

let frame = 0;
function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObject(planeMesh);

    frame += 0.01;
    const { array, originalPosition, randomValues } =
        planeMesh.geometry.attributes.position;
    for (let i = 0; i < array.length; i += 3) {
        array[i] =
            originalPosition[i] + Math.cos(frame + randomValues[i]) * 0.004;

        array[i + 1] =
            originalPosition[i + 1] +
            Math.sin(frame + randomValues[i + 1]) * 0.004;
    }
    planeMesh.geometry.attributes.position.needsUpdate = true;

    if (intersects.length > 0) {
        const { color } = intersects[0].object.geometry.attributes;

        const initialColor = {
            r: 0,
            g: 0.19,
            b: 0.4,
        };

        const hoverColor = {
            r: 0.1,
            g: 0.5,
            b: 1,
        };
        gsap.to(hoverColor, {
            r: initialColor.r,
            g: initialColor.g,
            b: initialColor.b,
            duration: 1,
            onUpdate: () => {
                // vertice 1
                color.setX(intersects[0].face.a, hoverColor.r);
                color.setY(intersects[0].face.a, hoverColor.g);
                color.setZ(intersects[0].face.a, hoverColor.b);

                // vertice 2
                color.setX(intersects[0].face.b, hoverColor.r);
                color.setY(intersects[0].face.b, hoverColor.g);
                color.setZ(intersects[0].face.b, hoverColor.b);

                // vertice 3
                color.setX(intersects[0].face.c, hoverColor.r);
                color.setY(intersects[0].face.c, hoverColor.g);
                color.setZ(intersects[0].face.c, hoverColor.b);

                color.needsUpdate = true;
            },
        });
    }
}

window.addEventListener("resize", onWindowResize, false);
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.render(scene, camera);
}

animate();

window.addEventListener("mousemove", (event) => {
    mouse.x = (event.clientX / innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / innerHeight) * 2 + 1;
});
