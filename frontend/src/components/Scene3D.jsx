import { useEffect, useRef } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

export default function Scene3D() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    const calm = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const r = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    r.setPixelRatio(Math.min(devicePixelRatio, 2));
    r.setSize(innerWidth, innerHeight);
    el.appendChild(r.domElement);
    const scene = new THREE.Scene();
    scene.environment = new THREE.PMREMGenerator(r).fromScene(new RoomEnvironment(), 0.04).texture;
    const cam = new THREE.PerspectiveCamera(45, innerWidth / innerHeight, 0.1, 100);
    cam.position.z = 6.5;
    const mat = new THREE.MeshPhysicalMaterial({ color: 0xcdbbff, metalness: 0.2, roughness: 0.07, iridescence: 1, iridescenceIOR: 1.7, clearcoat: 1, envMapIntensity: 1.5 });
    const geo = new THREE.SphereGeometry(1.6, 64, 64);
    const base = geo.attributes.position.array.slice();
    const orb = new THREE.Mesh(geo, mat);
    scene.add(orb);
    const l1 = new THREE.PointLight(0xff9ec7, 60, 25); l1.position.set(-4, 2, 4);
    const l2 = new THREE.PointLight(0x8fb4ff, 60, 25); l2.position.set(4, -2, 4);
    scene.add(l1, l2);
    const minis = Array.from({ length: 8 }, (_, i) => {
      const m = new THREE.Mesh(new THREE.SphereGeometry(0.08 + Math.random() * 0.22, 32, 32), mat);
      m.userData = { a: Math.random() * 6.28, r: 2.6 + Math.random() * 2.2, s: 0.15 + Math.random() * 0.3, y: Math.random() * 3 - 1.5 };
      scene.add(m); return m;
    });
    let mx = 0, my = 0, raf;
    const move = (e) => { mx = (e.clientX / innerWidth - 0.5) * 2; my = (e.clientY / innerHeight - 0.5) * 2; };
    const resize = () => { r.setSize(innerWidth, innerHeight); cam.aspect = innerWidth / innerHeight; cam.updateProjectionMatrix(); };
    addEventListener("mousemove", move); addEventListener("resize", resize);
    const pos = geo.attributes.position;
    const tick = (ms) => {
      const t = ms / 1000, s = scrollY / innerHeight;
      for (let i = 0; i < pos.count; i++) {
        const x = base[i * 3], y = base[i * 3 + 1], z = base[i * 3 + 2];
        const k = 1 + 0.13 * Math.sin(x * 1.5 + t) * Math.sin(y * 1.5 + t * 0.8) * Math.sin(z * 1.5 + t * 0.6);
        pos.setXYZ(i, x * k, y * k, z * k);
      }
      pos.needsUpdate = true; geo.computeVertexNormals();
      const wide = innerWidth > 900;
      const tx = (wide ? 2.4 : 0) * Math.cos(s * 1.1) + mx * 0.3, ty = Math.sin(s * 0.8) * 0.7 - my * 0.2;
      orb.position.x += (tx - orb.position.x) * 0.06; orb.position.y += (ty - orb.position.y) * 0.06;
      orb.rotation.y = t * 0.25 + s; orb.rotation.x = t * 0.12;
      minis.forEach((m) => { const d = m.userData; const a = d.a + t * d.s; m.position.set(orb.position.x + Math.cos(a) * d.r, orb.position.y + d.y + Math.sin(a * 1.3) * 0.4, Math.sin(a) * 1.5 - 1); });
      r.render(scene, cam);
      if (!calm) raf = requestAnimationFrame(tick);
    };
    tick(0);
    return () => { cancelAnimationFrame(raf); removeEventListener("mousemove", move); removeEventListener("resize", resize); r.dispose(); el.removeChild(r.domElement); };
  }, []);
  return <div ref={ref} className="bg3d" aria-hidden="true" />;
}
