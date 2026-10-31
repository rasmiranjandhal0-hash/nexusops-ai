import React, { useRef, useEffect, Suspense } from "react";
import * as THREE from "three";

export function GenerativeArtScene() {
  const mountRef = useRef<HTMLDivElement>(null);
  const lightRef = useRef<THREE.PointLight | null>(null);

  useEffect(() => {
    const currentMount = mountRef.current;
    if (!currentMount) return;

    const scene = new THREE.Scene();
    const width = currentMount.clientWidth || window.innerWidth;
    const height = currentMount.clientHeight || window.innerHeight;

    const camera = new THREE.PerspectiveCamera(
      70,
      width / height,
      0.1,
      1000
    );
    camera.position.z = 3.2;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    currentMount.appendChild(renderer.domElement);

    // Root 3D assembly group for global floating, rotation, and mouse parallax
    const assemblyGroup = new THREE.Group();
    scene.add(assemblyGroup);

    // 1. Primary Morphing 3D Sphere (White <-> Grey <-> White transition)
    const geometry = new THREE.IcosahedronGeometry(1.25, 64);
    const material = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        pointLightPosition: { value: new THREE.Vector3(0, 0, 5) },
        color: { value: new THREE.Color(0xffffff) },
        colorCycle: { value: 1.0 }, // 1.0 = white, 0.0 = grey
      },
      vertexShader: `
        uniform float time;
        varying vec3 vNormal;
        varying vec3 vPosition;
        varying float vNoise;
        
        // Simplex/Perlin noise implementation
        vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
        vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
        vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
        vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
        float snoise(vec3 v) {
            const vec2 C = vec2(1.0/6.0, 1.0/3.0);
            const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
            vec3 i = floor(v + dot(v, C.yyy));
            vec3 x0 = v - i + dot(i, C.xxx);
            vec3 g = step(x0.yzx, x0.xyz);
            vec3 l = 1.0 - g;
            vec3 i1 = min(g.xyz, l.zxy);
            vec3 i2 = max(g.xyz, l.zxy);
            vec3 x1 = x0 - i1 + C.xxx;
            vec3 x2 = x0 - i2 + C.yyy;
            vec3 x3 = x0 - D.yyy;
            i = mod289(i);
            vec4 p = permute(permute(permute(
                        i.z + vec4(0.0, i1.z, i2.z, 1.0))
                    + i.y + vec4(0.0, i1.y, i2.y, 1.0))
                    + i.x + vec4(0.0, i1.x, i2.x, 1.0));
            float n_ = 0.142857142857;
            vec3 ns = n_ * D.wyz - D.xzx;
            vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
            vec4 x_ = floor(j * ns.z);
            vec4 y_ = floor(j - 7.0 * x_);
            vec4 x = x_ * ns.x + ns.yyyy;
            vec4 y = y_ * ns.x + ns.yyyy;
            vec4 h = 1.0 - abs(x) - abs(y);
            vec4 b0 = vec4(x.xy, y.xy);
            vec4 b1 = vec4(x.zw, y.zw);
            vec4 s0 = floor(b0) * 2.0 + 1.0;
            vec4 s1 = floor(b1) * 2.0 + 1.0;
            vec4 sh = -step(h, vec4(0.0));
            vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
            vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
            vec3 p0 = vec3(a0.xy, h.x);
            vec3 p1 = vec3(a0.zw, h.y);
            vec3 p2 = vec3(a1.xy, h.z);
            vec3 p3 = vec3(a1.zw, h.w);
            vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
            p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
            vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
            m = m * m;
            return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
        }

        void main() {
            vNormal = normal;
            vPosition = position;
            // Harmonic 3D wave morphing across the surface
            float noiseA = snoise(position * 1.8 + vec3(time * 0.45, time * 0.35, time * 0.4));
            float noiseB = snoise(position * 3.0 - vec3(time * 0.25, time * 0.4, time * 0.3));
            float displacement = (noiseA * 0.18 + noiseB * 0.07);
            vNoise = displacement;
            vec3 newPosition = position + normal * displacement;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 color;
        uniform vec3 pointLightPosition;
        uniform float colorCycle;
        varying vec3 vNormal;
        varying vec3 vPosition;
        varying float vNoise;
        
        void main() {
            vec3 normal = normalize(vNormal);
            vec3 lightDir = normalize(pointLightPosition - vPosition);
            float diffuse = max(dot(normal, lightDir), 0.15);
            
            // Optical Fresnel effect for glowing perimeter
            float fresnel = 1.0 - abs(dot(normal, vec3(0.0, 0.0, 1.0)));
            fresnel = pow(fresnel, 2.2);
            
            // Specular metallic sheen
            vec3 viewDir = normalize(-vPosition);
            vec3 halfVector = normalize(lightDir + viewDir);
            float spec = pow(max(dot(normal, halfVector), 0.0), 28.0);
            
            // Interpolate highlights between sleek metallic chrome and pure radiant white
            vec3 highlight = mix(vec3(0.72, 0.74, 0.78), vec3(1.0, 1.0, 1.0), colorCycle);
            vec3 finalColor = color * (diffuse * 0.65 + 0.35) + highlight * (fresnel * 0.75 + spec * 0.45);
            
            // Dynamic alpha modulation
            float alpha = clamp(0.35 + fresnel * 0.55 + diffuse * 0.2, 0.0, 0.95);
            gl_FragColor = vec4(finalColor, alpha);
        }
      `,
      wireframe: true,
      transparent: true,
    });

    const mesh = new THREE.Mesh(geometry, material);
    assemblyGroup.add(mesh);

    // 2. Counter-Rotating Inner 3D Lattice Core (Adds Multi-Layer Parallax Depth)
    const innerGeometry = new THREE.IcosahedronGeometry(0.72, 16);
    const innerMaterial = new THREE.MeshStandardMaterial({
      color: 0xcccccc,
      metalness: 0.85,
      roughness: 0.25,
      wireframe: true,
      transparent: true,
      opacity: 0.45,
    });
    const innerMesh = new THREE.Mesh(innerGeometry, innerMaterial);
    assemblyGroup.add(innerMesh);

    // 3. Tilted 3D Celestial Gyroscope Rings
    const ring1Geometry = new THREE.TorusGeometry(1.68, 0.006, 16, 120);
    const ring1Material = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.4,
    });
    const ring1 = new THREE.Mesh(ring1Geometry, ring1Material);
    ring1.rotation.x = Math.PI * 0.32;
    ring1.rotation.y = Math.PI * 0.18;
    assemblyGroup.add(ring1);

    const ring2Geometry = new THREE.TorusGeometry(1.92, 0.005, 16, 120);
    const ring2Material = new THREE.MeshBasicMaterial({
      color: 0x888888,
      transparent: true,
      opacity: 0.3,
    });
    const ring2 = new THREE.Mesh(ring2Geometry, ring2Material);
    ring2.rotation.x = -Math.PI * 0.38;
    ring2.rotation.z = Math.PI * 0.22;
    assemblyGroup.add(ring2);

    // 4. Floating 3D Starfield / Quantum Dust Particles
    const particleCount = 140;
    const particlePositions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      const radius = 1.45 + Math.random() * 1.25;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      particlePositions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      particlePositions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      particlePositions[i * 3 + 2] = radius * Math.cos(phi);
    }
    const particleGeometry = new THREE.BufferGeometry();
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particleMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.022,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending,
    });
    const particles = new THREE.Points(particleGeometry, particleMaterial);
    assemblyGroup.add(particles);

    // Dynamic 3D Point Light
    const pointLight = new THREE.PointLight(0xffffff, 1.2, 100);
    pointLight.position.set(0, 0, 5);
    lightRef.current = pointLight;
    scene.add(pointLight);

    // Mouse Parallax coordinates (smoothed via damping)
    let targetRotationX = 0;
    let targetRotationY = 0;

    // Palette definition for cycling:
    // Pure Bright White (0xffffff) <---> Sophisticated Metallic Slate Grey (0x64748b / 0x71717a)
    const whiteColor = new THREE.Color(0xffffff);
    const greyColor = new THREE.Color(0x6b7280); // refined silver-slate grey
    const currentColor = new THREE.Color();

    let frameId: number;
    const animate = (t: number) => {
      // 1. Continuous smooth color cycle: White -> Grey -> White again
      // Frequency: smooth undulating cycle every ~6.2 seconds
      const cycle = (Math.sin(t * 0.001) + 1.0) * 0.5; // Oscillates smoothly between 0.0 and 1.0
      currentColor.lerpColors(greyColor, whiteColor, cycle);

      material.uniforms.color.value.copy(currentColor);
      material.uniforms.colorCycle.value = cycle;
      innerMaterial.color.copy(currentColor);
      ring1Material.color.copy(currentColor);
      ring2Material.color.copy(currentColor);
      particleMaterial.color.copy(currentColor);

      // 2. Vertex wave time update
      material.uniforms.time.value = t * 0.00035;

      // 3. Multi-Axis 3D Precession and Rotation
      mesh.rotation.y = t * 0.00055 + Math.sin(t * 0.0003) * 0.18;
      mesh.rotation.x = t * 0.0003 + Math.cos(t * 0.0004) * 0.12;
      mesh.rotation.z = Math.sin(t * 0.0002) * 0.08;

      // 4. Counter-rotation for inner core (creates pronounced 3D parallax)
      innerMesh.rotation.y = -t * 0.0007;
      innerMesh.rotation.x = -t * 0.0004;
      innerMesh.rotation.z = t * 0.0003;

      // 5. Gyroscopic rings orbit on tilted planes
      ring1.rotation.z += 0.001;
      ring1.rotation.y += 0.0006;
      ring2.rotation.z -= 0.0009;
      ring2.rotation.x += 0.0005;

      // 6. Particle swarm rotation
      particles.rotation.y = t * 0.00025;
      particles.rotation.x = t * 0.00015;

      // 7. Harmonic 3D Levitation (Floating & Breathing Pulse)
      assemblyGroup.position.y = Math.sin(t * 0.0011) * 0.14;
      assemblyGroup.position.x = Math.cos(t * 0.0008) * 0.08;
      assemblyGroup.position.z = Math.sin(t * 0.0006) * 0.1;

      const breathingScale = 1.0 + Math.sin(t * 0.0014) * 0.055;
      mesh.scale.set(breathingScale, breathingScale, breathingScale);

      // 8. Smooth Interactive 3D Mouse Parallax
      assemblyGroup.rotation.y += (targetRotationY - assemblyGroup.rotation.y) * 0.04;
      assemblyGroup.rotation.x += (targetRotationX - assemblyGroup.rotation.x) * 0.04;

      renderer.render(scene, camera);
      frameId = requestAnimationFrame(animate);
    };
    animate(0);

    const handleResize = () => {
      if (!currentMount) return;
      const w = currentMount.clientWidth;
      const h = currentMount.clientHeight;
      if (h === 0 || w === 0) return;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = -(e.clientY / window.innerHeight) * 2 + 1;
      targetRotationY = x * 0.35;
      targetRotationX = -y * 0.25;

      const vec = new THREE.Vector3(x, y, 0.5).unproject(camera);
      const dir = vec.sub(camera.position).normalize();
      const dist = -camera.position.z / dir.z;
      const pos = camera.position.clone().add(dir.multiplyScalar(dist));
      if (lightRef.current) {
        lightRef.current.position.copy(pos);
      }
      material.uniforms.pointLightPosition.value = pos;
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      if (currentMount && renderer.domElement.parentNode === currentMount) {
        currentMount.removeChild(renderer.domElement);
      }
      geometry.dispose();
      material.dispose();
      innerGeometry.dispose();
      innerMaterial.dispose();
      ring1Geometry.dispose();
      ring1Material.dispose();
      ring2Geometry.dispose();
      ring2Material.dispose();
      particleGeometry.dispose();
      particleMaterial.dispose();
      renderer.dispose();
    };
  }, []);

  return <div ref={mountRef} className="absolute inset-0 w-full h-full z-0 pointer-events-none" />;
}

export function AnomalousMatterHero({
  title = "Observation Log: Anomaly 7",
  subtitle = "Matter in a state of constant, beautiful flux.",
  description = "A new form of digital existence has been observed. It responds to stimuli, changes form, and exudes an unknown energy. Further study is required.",
}: {
  title?: string;
  subtitle?: string;
  description?: string;
}) {
  return (
    <section
      role="banner"
      className="relative w-full h-screen bg-[#030306] text-white overflow-hidden"
    >
      <Suspense fallback={<div className="w-full h-full bg-[#030306]" />}>
        <GenerativeArtScene />
      </Suspense>

      <div className="absolute inset-0 bg-gradient-to-t from-[#030306] via-[#030306]/60 to-transparent z-10 pointer-events-none" />

      <div className="relative z-20 flex flex-col items-center justify-end h-full pb-20 md:pb-32 text-center pointer-events-none">
        <div className="max-w-3xl px-4 animate-fade-in-long pointer-events-auto">
          <h1 className="text-xs sm:text-sm font-mono tracking-widest text-slate-300 uppercase">
            {title}
          </h1>
          <p className="mt-4 text-3xl md:text-5xl font-bold leading-tight tracking-tight text-white">
            {subtitle}
          </p>
          <p className="mt-6 max-w-xl mx-auto text-sm sm:text-base leading-relaxed text-slate-300">
            {description}
          </p>
        </div>
      </div>
    </section>
  );
}

export default AnomalousMatterHero;
