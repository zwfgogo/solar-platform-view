/**
 * 水波球模型
 */
import classNames from 'classnames';
import React, { useCallback, useEffect, useRef } from 'react'
import * as THREE from 'three'
import './component.less'

interface Props {
  className?: string,
  color?: string | number, //水波球的颜色
}

const PointWaves: React.FC<Props> = (props) => {
  const { className, color } = props

  const SEPARATION = 100, AMOUNTX = 50, AMOUNTY = 50;

  let container, stats;
  let camera, scene, renderer;

  let particles, count = 0;

  let mouseX = 0, mouseY = 0;

  let windowHalfX = window.innerWidth / 2;
  let windowHalfY = window.innerHeight / 2;
  const treeBoxRef = useRef();

  useEffect(() => {
    init();
    animate();
  }, [])

  const init = useCallback(
    () => {

      container = treeBoxRef.current
      const width = container.clientWidth; //窗口宽度
      const height = container.clientHeight; //窗口高度
      camera = new THREE.PerspectiveCamera(75, width / height, 1, 10000);
      camera.position.z = 3000;
      // camera.position.y = -100;
      //  camera.position.set(500, 3000, 4000)

      scene = new THREE.Scene();

      const numParticles = AMOUNTX * AMOUNTY;

      const positions = new Float32Array(numParticles * 3);
      const scales = new Float32Array(numParticles);

      let i = 0, j = 0;

      for (let ix = 0; ix < AMOUNTX; ix++) {
        for (let iy = 0; iy < AMOUNTY; iy++) {
          positions[i] = ix * SEPARATION - ((AMOUNTX * SEPARATION) / 2); // x
          positions[i + 1] = 0; // y
          positions[i + 2] = iy * SEPARATION - ((AMOUNTY * SEPARATION) / 2); // z

          scales[j] = 1;
          i += 3;
          j++;

        }

      }

      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      geometry.setAttribute('scale', new THREE.BufferAttribute(scales, 1));

      const material = new THREE.ShaderMaterial({
        uniforms: {
          color: { value: new THREE.Color(color ?? 0xffffff) },
        },
        vertexShader: `attribute float scale;
 
         void main() {
 
           vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
 
           gl_PointSize = scale * ( 200.0 / - mvPosition.z );
 
           gl_Position = projectionMatrix * mvPosition;
 
         }`,
        fragmentShader: `uniform vec3 color;
         uniform float opacity;
 
         void main() {
 
           if ( length( gl_PointCoord - vec2( 0.5, 0.5 ) ) > 0.475 ) discard;
 
           gl_FragColor = vec4( color, opacity);
 
         }`
      });

      particles = new THREE.Points(geometry, material);
      scene.add(particles);

      //

      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.setSize(width, height);
      container.appendChild(renderer.domElement);

      // stats = new Stats();
      // container.appendChild(stats.dom);

      // container.style.touchAction = 'none';
      // container.addEventListener('pointermove', onPointerMove);

      //

      window.addEventListener('resize', onWindowResize);
    },
    [],
  )


  const animate = () => {

    requestAnimationFrame(animate);
    render();
    // stats.update();
  }

  const render = () => {
    camera.position.x += (mouseX - camera.position.x) * .05;
    camera.position.y += (- mouseY - camera.position.y) * .05 + 10;
    camera.lookAt(scene.position);

    const positions = particles.geometry.attributes.position.array;
    const scales = particles.geometry.attributes.scale.array;

    let i = 0, j = 0;

    for (let ix = 0; ix < AMOUNTX; ix++) {

      for (let iy = 0; iy < AMOUNTY; iy++) {

        positions[i + 1] = (Math.sin((ix + count) * 0.3) * 50) +
          (Math.sin((iy + count) * 0.5) * 50);

        scales[j] = (Math.sin((ix + count) * 0.3) + 1) * 20 +
          (Math.sin((iy + count) * 0.5) + 1) * 20;

        i += 3;
        j++;

      }

    }

    particles.geometry.attributes.position.needsUpdate = true;
    particles.geometry.attributes.scale.needsUpdate = true;

    renderer.render(scene, camera);

    count += 0.1;
  }

  const onWindowResize = () => {
    const width = container.clientWidth; //窗口宽度
    const height = container.clientHeight; //窗口高度
    renderer.setSize(width, height);
  }

  return (
    <div className={classNames("threeBox", className)} ref={treeBoxRef} />
  )
}

export default PointWaves

