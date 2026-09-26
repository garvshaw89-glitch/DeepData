import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Layers, Activity, Eye, RotateCw } from 'lucide-react';

interface MarketSpatialCanvasProps {
  onSelectSymbol?: (symbol: string) => void;
  className?: string;
}

type CanvasMode = 'topology' | 'surface' | 'streams';

interface NodeData {
  symbol: string;
  name: string;
  sector: string;
  price: string;
  change: string;
  isPositive: boolean;
  position: THREE.Vector3;
}

const MARKET_NODES: Omit<NodeData, 'position'>[] = [
  { symbol: 'RELIANCE', name: 'Reliance Industries Ltd.', sector: 'Energy & Conglomerate', price: '₹2,965.50', change: '+1.42%', isPositive: true },
  { symbol: 'AAPL', name: 'Apple Inc.', sector: 'Consumer Technology', price: '$189.20', change: '+1.85%', isPositive: true },
  { symbol: 'NVDA', name: 'NVIDIA Corp.', sector: 'AI & Semiconductors', price: '$875.30', change: '+3.14%', isPositive: true },
  { symbol: 'TCS', name: 'Tata Consultancy Services', sector: 'Enterprise Software', price: '₹3,845.00', change: '+0.75%', isPositive: true },
  { symbol: 'HDFCBANK', name: 'HDFC Bank Ltd.', sector: 'Private Banking', price: '₹1,560.00', change: '-0.38%', isPositive: false },
  { symbol: 'SPY', name: 'S&P 500 ETF Trust', sector: 'Broad Market Equity', price: '$512.40', change: '+0.62%', isPositive: true },
  { symbol: 'GLD', name: 'SPDR Gold Shares', sector: 'Precious Metals', price: '$202.15', change: '+0.45%', isPositive: true },
  { symbol: 'US10Y', name: 'US 10-Year Treasury Yield', sector: 'Sovereign Debt', price: '4.24%', change: '-0.05%', isPositive: true },
];

export const MarketSpatialCanvas: React.FC<MarketSpatialCanvasProps> = ({
  onSelectSymbol,
  className = '',
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [activeMode, setActiveMode] = useState<CanvasMode>('topology');
  const [hoveredNode, setHoveredNode] = useState<NodeData | null>(null);
  const [isAutoRotate, setIsAutoRotate] = useState<boolean>(true);
  const [hasWebGLError, setHasWebGLError] = useState<boolean>(false);

  // References to keep scene loop dynamic without recreating WebGL context
  const sceneRef = useRef<THREE.Scene | null>(null);
  const modeRef = useRef<CanvasMode>('topology');
  const autoRotateRef = useRef<boolean>(true);
  const mouseTargetRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const mouseCurrentRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  useEffect(() => {
    modeRef.current = activeMode;
  }, [activeMode]);

  useEffect(() => {
    autoRotateRef.current = isAutoRotate;
  }, [isAutoRotate]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Check WebGL availability
    const canvasTest = document.createElement('canvas');
    const gl = canvasTest.getContext('webgl') || canvasTest.getContext('experimental-webgl');
    if (!gl) {
      setHasWebGLError(true);
      return;
    }

    let width = container.clientWidth || 800;
    let height = container.clientHeight || 500;

    // 1. Scene & Fog
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x070709, 0.015);
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 18, 55);

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.setClearColor(0x070709, 0);
    container.appendChild(renderer.domElement);

    // 4. Lights
    const ambientLight = new THREE.AmbientLight(0x0f172a, 2.5);
    scene.add(ambientLight);

    const cyanPointLight = new THREE.PointLight(0x06b6d4, 4, 100);
    cyanPointLight.position.set(20, 25, 20);
    scene.add(cyanPointLight);

    const emeraldPointLight = new THREE.PointLight(0x10b981, 2.5, 90);
    emeraldPointLight.position.set(-20, -15, 10);
    scene.add(emeraldPointLight);

    // -------------------------------------------------------------
    // GROUP 1: SPATIAL MARKET TOPOLOGY (Nodes + Network Lines + Ambient Cloud)
    // -------------------------------------------------------------
    const topologyGroup = new THREE.Group();
    scene.add(topologyGroup);

    // Dynamic positioned market nodes
    const nodeMeshes: { mesh: THREE.Mesh; data: NodeData }[] = [];
    const nodeGeometry = new THREE.SphereGeometry(1.2, 16, 16);

    MARKET_NODES.forEach((item, idx) => {
      const angle = (idx / MARKET_NODES.length) * Math.PI * 2;
      const radius = 22 + (idx % 2 === 0 ? 4 : -4);
      const y = (Math.sin(angle * 3) * 6);
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;

      const position = new THREE.Vector3(x, y, z);
      const nodeMaterial = new THREE.MeshStandardMaterial({
        color: item.isPositive ? 0x06b6d4 : 0xf43f5e,
        emissive: item.isPositive ? 0x0891b2 : 0xbe123c,
        emissiveIntensity: 0.8,
        roughness: 0.2,
        metalness: 0.8,
      });

      const mesh = new THREE.Mesh(nodeGeometry, nodeMaterial);
      mesh.position.copy(position);
      topologyGroup.add(mesh);

      // Subtle glow outer halo ring
      const haloGeo = new THREE.RingGeometry(1.5, 1.8, 32);
      const haloMat = new THREE.MeshBasicMaterial({
        color: item.isPositive ? 0x22d3ee : 0xfb7185,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.4,
      });
      const halo = new THREE.Mesh(haloGeo, haloMat);
      halo.lookAt(camera.position);
      mesh.add(halo);

      nodeMeshes.push({ mesh, data: { ...item, position } });
    });

    // Connecting Network Lines
    const linePositions: number[] = [];
    for (let i = 0; i < nodeMeshes.length; i++) {
      for (let j = i + 1; j < nodeMeshes.length; j++) {
        const p1 = nodeMeshes[i].mesh.position;
        const p2 = nodeMeshes[j].mesh.position;
        if (p1.distanceTo(p2) < 32) {
          linePositions.push(p1.x, p1.y, p1.z, p2.x, p2.y, p2.z);
        }
      }
    }
    const linesGeo = new THREE.BufferGeometry();
    linesGeo.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
    const linesMat = new THREE.LineBasicMaterial({
      color: 0x06b6d4,
      transparent: true,
      opacity: 0.18,
    });
    const networkLines = new THREE.LineSegments(linesGeo, linesMat);
    topologyGroup.add(networkLines);

    // Floating Ambient Data Particles
    const particleCount = 650;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      particlePositions[i] = (Math.random() - 0.5) * 80;
      particlePositions[i + 1] = (Math.random() - 0.5) * 45;
      particlePositions[i + 2] = (Math.random() - 0.5) * 80;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0x38bdf8,
      size: 0.75,
      transparent: true,
      opacity: 0.45,
    });
    const particleCloud = new THREE.Points(particleGeo, particleMat);
    topologyGroup.add(particleCloud);

    // Central Core Wireframe Orb
    const coreGeo = new THREE.IcosahedronGeometry(7, 2);
    const coreMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      wireframe: true,
      wireframeLinewidth: 1.5,
      emissive: 0x06b6d4,
      emissiveIntensity: 0.35,
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    topologyGroup.add(coreMesh);

    // -------------------------------------------------------------
    // GROUP 2: 3D VOLATILITY SURFACE (Interactive Parametric Wireframe)
    // -------------------------------------------------------------
    const surfaceGroup = new THREE.Group();
    scene.add(surfaceGroup);
    surfaceGroup.visible = false;

    const surfaceCols = 32;
    const surfaceRows = 32;
    const surfaceGeo = new THREE.PlaneGeometry(55, 55, surfaceCols, surfaceRows);
    surfaceGeo.rotateX(-Math.PI / 2.3);

    const surfaceMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      wireframe: true,
      emissive: 0x06b6d4,
      emissiveIntensity: 0.6,
      roughness: 0.3,
    });
    const surfaceMesh = new THREE.Mesh(surfaceGeo, surfaceMat);
    surfaceGroup.add(surfaceMesh);

    // -------------------------------------------------------------
    // GROUP 3: GLOBAL LIQUIDITY STREAMS (Particle Torus / Flow)
    // -------------------------------------------------------------
    const streamsGroup = new THREE.Group();
    scene.add(streamsGroup);
    streamsGroup.visible = false;

    const streamParticleCount = 900;
    const streamGeo = new THREE.BufferGeometry();
    const streamPositions = new Float32Array(streamParticleCount * 3);
    const streamAngles = new Float32Array(streamParticleCount);
    const streamSpeeds = new Float32Array(streamParticleCount);
    const streamRadii = new Float32Array(streamParticleCount);

    for (let i = 0; i < streamParticleCount; i++) {
      streamAngles[i] = Math.random() * Math.PI * 2;
      streamSpeeds[i] = 0.005 + Math.random() * 0.015;
      streamRadii[i] = 16 + Math.random() * 14;
      const idx = i * 3;
      streamPositions[idx] = Math.cos(streamAngles[i]) * streamRadii[i];
      streamPositions[idx + 1] = (Math.random() - 0.5) * 12;
      streamPositions[idx + 2] = Math.sin(streamAngles[i]) * streamRadii[i];
    }
    streamGeo.setAttribute('position', new THREE.BufferAttribute(streamPositions, 3));
    const streamMat = new THREE.PointsMaterial({
      color: 0x22d3ee,
      size: 1.1,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
    });
    const streamParticles = new THREE.Points(streamGeo, streamMat);
    streamsGroup.add(streamParticles);

    // -------------------------------------------------------------
    // Raycasting & Cursor Interactivity
    // -------------------------------------------------------------
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2(-10, -10);

    const onPointerMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const clientX = e.clientX - rect.left;
      const clientY = e.clientY - rect.top;

      mouse.x = (clientX / rect.width) * 2 - 1;
      mouse.y = -(clientY / rect.height) * 2 + 1;

      // Soft damping angles for camera parallax
      mouseTargetRef.current = {
        x: mouse.x * 6,
        y: mouse.y * 4,
      };
    };

    const onClick = () => {
      if (hoveredNode && onSelectSymbol) {
        onSelectSymbol(hoveredNode.symbol);
      }
    };

    container.addEventListener('mousemove', onPointerMove, { passive: true });
    container.addEventListener('click', onClick);

    // -------------------------------------------------------------
    // Animation Render Loop
    // -------------------------------------------------------------
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const elapsedTime = clock.getElapsedTime();

      // Camera Damping (Smooth Parallax)
      const ease = 0.05;
      mouseCurrentRef.current.x += (mouseTargetRef.current.x - mouseCurrentRef.current.x) * ease;
      mouseCurrentRef.current.y += (mouseTargetRef.current.y - mouseCurrentRef.current.y) * ease;

      camera.position.x = mouseCurrentRef.current.x;
      camera.position.y = 18 + mouseCurrentRef.current.y;
      camera.lookAt(0, 0, 0);

      // Mode visibility management
      const currentMode = modeRef.current;
      topologyGroup.visible = currentMode === 'topology';
      surfaceGroup.visible = currentMode === 'surface';
      streamsGroup.visible = currentMode === 'streams';

      // 1. Topology Motion
      if (currentMode === 'topology') {
        if (autoRotateRef.current) {
          topologyGroup.rotation.y += 0.0025;
        }
        coreMesh.rotation.y = elapsedTime * 0.15;
        coreMesh.rotation.x = elapsedTime * 0.1;

        // Pulse halos towards camera
        nodeMeshes.forEach((item) => {
          const halo = item.mesh.children[0];
          if (halo) halo.lookAt(camera.position);
        });

        // Raycasting for node hover
        raycaster.setFromCamera(mouse, camera);
        const meshesToCheck = nodeMeshes.map((n) => n.mesh);
        const intersects = raycaster.intersectObjects(meshesToCheck);

        if (intersects.length > 0) {
          const hitMesh = intersects[0].object as THREE.Mesh;
          const match = nodeMeshes.find((n) => n.mesh === hitMesh);
          if (match) {
            setHoveredNode(match.data);
            hitMesh.scale.set(1.4, 1.4, 1.4);
          }
        } else {
          setHoveredNode(null);
          nodeMeshes.forEach((n) => n.mesh.scale.set(1, 1, 1));
        }
      }

      // 2. Volatility Surface Dynamic Motion
      if (currentMode === 'surface') {
        if (autoRotateRef.current) {
          surfaceGroup.rotation.z += 0.002;
        }
        const posAttr = surfaceGeo.attributes.position;
        for (let i = 0; i < posAttr.count; i++) {
          const u = (i % (surfaceCols + 1)) / surfaceCols;
          const v = Math.floor(i / (surfaceCols + 1)) / surfaceRows;
          // Volatility smile curve + harmonic waves
          const wave = Math.sin(u * 8 + elapsedTime * 1.5) * Math.cos(v * 6 + elapsedTime) * 3.5;
          const smile = Math.pow((u - 0.5) * 2, 2) * 5.0;
          posAttr.setZ(i, wave + smile);
        }
        posAttr.needsUpdate = true;
      }

      // 3. Liquidity Streams Particle Motion
      if (currentMode === 'streams') {
        const positions = streamGeo.attributes.position.array as Float32Array;
        for (let i = 0; i < streamParticleCount; i++) {
          streamAngles[i] += streamSpeeds[i];
          const idx = i * 3;
          positions[idx] = Math.cos(streamAngles[i]) * streamRadii[i];
          positions[idx + 1] = Math.sin(streamAngles[i] * 3 + elapsedTime) * 4;
          positions[idx + 2] = Math.sin(streamAngles[i]) * streamRadii[i];
        }
        streamGeo.attributes.position.needsUpdate = true;
        streamsGroup.rotation.y = elapsedTime * 0.05;
      }

      renderer.render(scene, camera);
    };

    animate();

    // Resize Handler
    const handleResize = () => {
      if (!container) return;
      width = container.clientWidth;
      height = container.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);

    // Context Lost / Restored Handlers
    const handleContextLost = (e: Event) => {
      e.preventDefault();
      cancelAnimationFrame(animationFrameId);
      setHasWebGLError(true);
    };

    const handleContextRestored = () => {
      setHasWebGLError(false);
      animate();
    };

    renderer.domElement.addEventListener('webglcontextlost', handleContextLost, false);
    renderer.domElement.addEventListener('webglcontextrestored', handleContextRestored, false);

    // Cleanup on unmount
    return () => {
      window.removeEventListener('resize', handleResize);
      container.removeEventListener('mousemove', onPointerMove);
      container.removeEventListener('click', onClick);
      cancelAnimationFrame(animationFrameId);

      renderer.domElement.removeEventListener('webglcontextlost', handleContextLost);
      renderer.domElement.removeEventListener('webglcontextrestored', handleContextRestored);

      // Dispose Three.js memory allocations
      nodeGeometry.dispose();
      linesGeo.dispose();
      linesMat.dispose();
      particleGeo.dispose();
      particleMat.dispose();
      coreGeo.dispose();
      coreMat.dispose();
      surfaceGeo.dispose();
      surfaceMat.dispose();
      streamGeo.dispose();
      streamMat.dispose();

      renderer.dispose();
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  // WebGL Fallback View
  if (hasWebGLError) {
    return (
      <div className={`relative w-full h-[500px] flex items-center justify-center bg-[#070709] border border-white/[0.08] rounded-2xl overflow-hidden ${className}`}>
        <div className="text-center p-8 space-y-3 z-10 max-w-md">
          <div className="w-12 h-12 rounded-full bg-cyan-950/60 border border-cyan-500/30 flex items-center justify-center mx-auto text-cyan-400">
            <Activity className="w-6 h-6 animate-pulse" />
          </div>
          <h4 className="text-sm font-display font-semibold text-white tracking-wide uppercase">
            Spatial Market Engine Active
          </h4>
          <p className="text-xs text-slate-400 leading-relaxed font-sans">
            Autonomous multi-asset pricing matrix online. Accelerating real-time tick aggregation across global order flows.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative w-full h-[480px] sm:h-[580px] lg:h-[640px] rounded-2xl overflow-hidden border border-white/[0.07] bg-[#070709] ${className}`}>
      {/* 3D WebGL Canvas Mounting Container */}
      <div ref={mountRef} className="w-full h-full cursor-crosshair" />

      {/* Top Left Viewport Mode HUD Switcher */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-1.5 p-1 bg-[#0B0C0E]/80 backdrop-blur-md rounded-lg border border-white/[0.08]">
        <button
          onClick={() => setActiveMode('topology')}
          className={`px-2.5 py-1 rounded text-[11px] font-mono font-medium transition-all cursor-pointer ${
            activeMode === 'topology'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Topology
        </button>
        <button
          onClick={() => setActiveMode('surface')}
          className={`px-2.5 py-1 rounded text-[11px] font-mono font-medium transition-all cursor-pointer ${
            activeMode === 'surface'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Vol Surface
        </button>
        <button
          onClick={() => setActiveMode('streams')}
          className={`px-2.5 py-1 rounded text-[11px] font-mono font-medium transition-all cursor-pointer ${
            activeMode === 'streams'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Liquidity
        </button>
      </div>

      {/* Top Right Controls & Metrics */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
        <button
          onClick={() => setIsAutoRotate(!isAutoRotate)}
          className={`p-2 rounded-lg border backdrop-blur-md transition-colors cursor-pointer ${
            isAutoRotate
              ? 'bg-cyan-500/15 border-cyan-500/40 text-cyan-300'
              : 'bg-[#0B0C0E]/80 border-white/[0.08] text-slate-400 hover:text-white'
          }`}
          title="Toggle Auto Orbit Rotation"
        >
          <RotateCw className={`w-3.5 h-3.5 ${isAutoRotate ? 'animate-spin' : ''}`} style={{ animationDuration: '8s' }} />
        </button>

        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#0B0C0E]/80 border border-white/[0.08] backdrop-blur-md text-[11px] font-mono text-slate-400">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>60 FPS // WEBGL 2.0</span>
        </div>
      </div>

      {/* Bottom Floating Interactive Inspection Card (When Node is Hovered) */}
      {hoveredNode && (
        <div className="absolute bottom-6 left-6 z-20 max-w-sm bg-[#0E1015]/95 backdrop-blur-xl border border-cyan-500/40 rounded-xl p-3.5 shadow-2xl shadow-cyan-500/10 animate-in fade-in slide-in-from-bottom-2 duration-150 font-mono text-xs">
          <div className="flex items-center justify-between gap-3 pb-1.5 border-b border-white/[0.08]">
            <div className="flex items-center gap-2">
              <span className="font-bold text-white text-sm">{hoveredNode.symbol}</span>
              <span className="text-[10px] text-slate-400 font-sans">{hoveredNode.sector}</span>
            </div>
            <span className={`text-[11px] font-bold ${hoveredNode.isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
              {hoveredNode.change}
            </span>
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-slate-300 font-bold text-sm">{hoveredNode.price}</span>
            {onSelectSymbol && (
              <button
                onClick={() => onSelectSymbol(hoveredNode.symbol)}
                className="text-[10px] font-bold text-black bg-cyan-400 hover:bg-cyan-300 px-2.5 py-1 rounded transition-colors cursor-pointer"
              >
                Inspect in Terminal
              </button>
            )}
          </div>
        </div>
      )}

      {/* Subtle Bottom Instruction */}
      <div className="absolute bottom-4 right-4 z-10 text-[10px] font-mono text-slate-500 pointer-events-none hidden md:block">
        CURSOR INTERACTION: MOVE TO TILT CAMERA · HOVER NODE TO INSPECT
      </div>
    </div>
  );
};
