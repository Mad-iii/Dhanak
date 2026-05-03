import { Camera, Mesh, Plane, Program, Renderer, Texture, Transform, Raycast, Vec2 } from 'ogl';
import { useEffect, useRef, useState } from 'react';

type GL = Renderer['gl'];

function debounce<T extends (...args: any[]) => void>(func: T, wait: number) {
  let timeout: number;
  return function (this: any, ...args: Parameters<T>) {
    window.clearTimeout(timeout);
    timeout = window.setTimeout(() => func.apply(this, args), wait);
  };
}

function lerp(p1: number, p2: number, t: number): number {
  return p1 + (p2 - p1) * t;
}

function autoBind(instance: any): void {
  const proto = Object.getPrototypeOf(instance);
  Object.getOwnPropertyNames(proto).forEach(key => {
    if (key !== 'constructor' && typeof instance[key] === 'function') {
      instance[key] = instance[key].bind(instance);
    }
  });
}

function getFontSize(font: string): number {
  const match = font.match(/(\d+)px/);
  return match ? parseInt(match[1], 10) : 30;
}

function createTextTexture(
  gl: GL,
  text: string,
  font: string = 'bold 30px sans-serif',
  color: string = 'black'
): { texture: Texture; width: number; height: number } {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Could not get 2d context');

  context.font = font;
  const metrics = context.measureText(text);
  const textWidth = Math.ceil(metrics.width);
  const fontSize = getFontSize(font);
  const textHeight = Math.ceil(fontSize * 1.2);

  canvas.width = textWidth + 20;
  canvas.height = textHeight + 20;

  context.font = font;
  context.fillStyle = color;
  context.textBaseline = 'middle';
  context.textAlign = 'center';
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.fillText(text, canvas.width / 2, canvas.height / 2);

  const texture = new Texture(gl, { generateMipmaps: false });
  texture.image = canvas;
  return { texture, width: canvas.width, height: canvas.height };
}

interface TitleProps {
  gl: GL;
  plane: Mesh;
  renderer: Renderer;
  text: string;
  textColor?: string;
  font?: string;
}

class Title {
  gl: GL;
  plane: Mesh;
  renderer: Renderer;
  text: string;
  textColor: string;
  font: string;
  mesh!: Mesh;

  constructor({ gl, plane, renderer, text, textColor = '#1A0A00', font = '30px sans-serif' }: TitleProps) {
    autoBind(this);
    this.gl = gl;
    this.plane = plane;
    this.renderer = renderer;
    this.text = text;
    this.textColor = textColor;
    this.font = font;
    this.createMesh();
  }

  createMesh() {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not get 2d context');

    // Make canvas large for quality
    canvas.width = 600;
    canvas.height = 300;

    // Background for info section (brand-ivory)
    ctx.fillStyle = '#FBFAF3'; 
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Subtle Grid Pattern (brand-black/5)
    ctx.strokeStyle = 'rgba(26, 10, 0, 0.05)';
    ctx.lineWidth = 1;
    for(let i = 0; i < canvas.width; i += 40) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, canvas.height);
        ctx.stroke();
    }
    for(let i = 0; i < canvas.height; i += 40) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(canvas.width, i);
        ctx.stroke();
    }

    // Border (brand-black)
    ctx.strokeStyle = '#1A0A00';
    ctx.lineWidth = 20;
    ctx.strokeRect(0, 0, canvas.width, canvas.height);

    // Text rendering
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    const [name, price] = this.text.split(' • ');
    if (price) {
        // Name
        ctx.font = '900 italic 42px sans-serif';
        ctx.fillStyle = '#1A0A00';
        ctx.fillText(name.toUpperCase(), canvas.width / 2, canvas.height / 2 - 45);
        
        // Price Tag
        ctx.fillStyle = '#FFE600'; // brand-yellow
        const priceMetrics = ctx.measureText(price);
        const priceWidth = priceMetrics.width + 40;
        ctx.fillRect(canvas.width / 2 - priceWidth / 2, canvas.height / 2 + 10, priceWidth, 50);
        ctx.strokeStyle = '#1A0A00';
        ctx.lineWidth = 4;
        ctx.strokeRect(canvas.width / 2 - priceWidth / 2, canvas.height / 2 + 10, priceWidth, 50);

        ctx.font = '900 32px monospace';
        ctx.fillStyle = '#1A0A00';
        ctx.fillText(price, canvas.width / 2, canvas.height / 2 + 35);
    } else {
        ctx.font = this.font;
        ctx.fillStyle = this.textColor;
        ctx.fillText(this.text, canvas.width / 2, canvas.height / 2 - 20);
    }

    // Quick Add "Button" at bottom (brand-magenta)
    ctx.fillStyle = '#FF0080'; 
    ctx.fillRect(80, canvas.height - 100, canvas.width - 160, 60);
    ctx.strokeStyle = '#1A0A00';
    ctx.lineWidth = 4;
    ctx.strokeRect(80, canvas.height - 100, canvas.width - 160, 60);
    
    // Shadow for button
    ctx.fillStyle = '#1A0A00';
    ctx.fillRect(86, canvas.height - 94, canvas.width - 160, 60);
    ctx.fillStyle = '#FF0080';
    ctx.fillRect(80, canvas.height - 100, canvas.width - 160, 60);
    ctx.strokeRect(80, canvas.height - 100, canvas.width - 160, 60);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = '900 24px sans-serif';
    ctx.fillText('ADD TO CART +', canvas.width / 2, canvas.height - 70);

    const texture = new Texture(this.gl, {
      generateMipmaps: false,
      image: canvas
    });

    const geometry = new Plane(this.gl);
    const program = new Program(this.gl, {
      vertex: `
        precision highp float;
        attribute vec3 position;
        attribute vec2 uv;
        uniform mat4 modelViewMatrix;
        uniform mat4 projectionMatrix;
        uniform float uTime;
        uniform float uSpeed;
        varying vec2 vUv;
        void main() {
          vUv = uv;
          vec3 p = position;
          p.z = (sin(p.x * 4.0 + uTime) * 1.5 + cos(p.y * 2.0 + uTime) * 1.5) * (0.1 + uSpeed * 0.5);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
        }
      `,
      fragment: `
        precision highp float;
        uniform sampler2D tMap;
        uniform float uAlpha;
        varying vec2 vUv;
        void main() {
          vec4 color = texture2D(tMap, vUv);
          if (color.a < 0.1) discard;
          gl_FragColor = vec4(color.rgb, color.a * uAlpha);
        }
      `,
      uniforms: { 
        tMap: { value: texture },
        uAlpha: { value: 0 },
        uTime: { value: 0 },
        uSpeed: { value: 0 }
      },
      transparent: true
    });
    this.mesh = new Mesh(this.gl, { geometry, program });
    
    // Adjust scale based on plane
    const aspect = canvas.width / canvas.height;
    const textHeightScaled = this.plane.scale.y * 0.4;
    const textWidthScaled = textHeightScaled * aspect;
    this.mesh.scale.set(textWidthScaled, textHeightScaled, 1);
    this.mesh.renderOrder = 2; // Behind plane
    // Removed setParent(this.plane) to make it a sibling
  }
}

interface ScreenSize {
  width: number;
  height: number;
}

interface Viewport {
  width: number;
  height: number;
}

interface MediaProps {
  geometry: Plane;
  gl: GL;
  image: string;
  index: number;
  length: number;
  renderer: Renderer;
  scene: Transform;
  screen: ScreenSize;
  text: string;
  viewport: Viewport;
  bend: number;
  textColor: string;
  borderRadius?: number;
  font?: string;
  onClick?: () => void;
}

class Media {
  extra: number = 0;
  geometry: Plane;
  gl: GL;
  image: string;
  index: number;
  length: number;
  renderer: Renderer;
  scene: Transform;
  screen: ScreenSize;
  text: string;
  viewport: Viewport;
  bend: number;
  textColor: string;
  borderRadius: number;
  font?: string;
  program!: Program;
  plane!: Mesh;
  shadow1Mesh!: Mesh;
  shadow2Mesh!: Mesh;
  title!: Title;
  scale!: number;
  padding!: number;
  width!: number;
  widthTotal!: number;
  x!: number;
  speed: number = 0;
  isBefore: boolean = false;
  isAfter: boolean = false;
  isHovered: boolean = false;
  hoverValue: number = 0;
  onClick?: () => void;

  constructor({
    geometry,
    gl,
    image,
    index,
    length,
    renderer,
    scene,
    screen,
    text,
    viewport,
    bend,
    textColor,
    borderRadius = 0,
    font,
    onClick
  }: MediaProps) {
    this.geometry = geometry;
    this.gl = gl;
    this.image = image;
    this.index = index;
    this.length = length;
    this.renderer = renderer;
    this.scene = scene;
    this.screen = screen;
    this.text = text;
    this.viewport = viewport;
    this.bend = bend;
    this.textColor = textColor;
    this.borderRadius = borderRadius;
    this.font = font;
    this.onClick = onClick;
    this.createShader();
    this.createMesh();
    this.createShadows();
    this.createTitle();
    this.onResize();
  }

  createShader() {
    const texture = new Texture(this.gl, {
      generateMipmaps: true
    });
    this.program = new Program(this.gl, {
      depthTest: false,
      depthWrite: false,
      vertex: `
        precision highp float;
        attribute vec3 position;
        attribute vec2 uv;
        uniform mat4 modelViewMatrix;
        uniform mat4 projectionMatrix;
        uniform float uTime;
        uniform float uSpeed;
        varying vec2 vUv;
        void main() {
          vUv = uv;
          vec3 p = position;
          p.z = (sin(p.x * 4.0 + uTime) * 1.5 + cos(p.y * 2.0 + uTime) * 1.5) * (0.1 + uSpeed * 0.5);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
        }
      `,
      fragment: `
        precision highp float;
        uniform vec2 uImageSizes;
        uniform vec2 uPlaneSizes;
        uniform sampler2D tMap;
        uniform float uBorderRadius;
        varying vec2 vUv;
        
        float roundedBoxSDF(vec2 p, vec2 b, float r) {
          vec2 d = abs(p) - b;
          return length(max(d, vec2(0.0))) + min(max(d.x, d.y), 0.0) - r;
        }
        
        void main() {
          vec2 ratio = vec2(
            min((uPlaneSizes.x / uPlaneSizes.y) / (uImageSizes.x / uImageSizes.y), 1.0),
            min((uPlaneSizes.y / uPlaneSizes.x) / (uImageSizes.y / uImageSizes.x), 1.0)
          );
          vec2 uv = vec2(
            vUv.x * ratio.x + (1.0 - ratio.x) * 0.5,
            vUv.y * ratio.y + (1.0 - ratio.y) * 0.5
          );
          vec4 color = texture2D(tMap, uv);
          
          float d = roundedBoxSDF(vUv - 0.5, vec2(0.5 - uBorderRadius), uBorderRadius);
          
          // Smooth antialiasing for edges
          float edgeSmooth = 0.002;
          float alpha = 1.0 - smoothstep(-edgeSmooth, edgeSmooth, d);
          
          gl_FragColor = vec4(color.rgb, alpha);
        }
      `,
      uniforms: {
        tMap: { value: texture },
        uPlaneSizes: { value: [0, 0] },
        uImageSizes: { value: [1, 1] },
        uSpeed: { value: 0 },
        uHover: { value: 0 },
        uTime: { value: 100 * Math.random() },
        uBorderRadius: { value: this.borderRadius }
      },
      transparent: true
    });
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      texture.image = img;
      this.program.uniforms.uImageSizes.value = [Math.max(1, img.naturalWidth), Math.max(1, img.naturalHeight)];
    };
    img.src = this.image;
  }

  createMesh() {
    this.plane = new Mesh(this.gl, {
      geometry: this.geometry,
      program: this.program
    });
    this.plane.renderOrder = 10;
    this.plane.setParent(this.scene);
  }

  createShadows() {
    const shadowProgram = (color: string) => new Program(this.gl, {
      vertex: `
        precision highp float;
        attribute vec3 position;
        attribute vec2 uv;
        uniform mat4 modelViewMatrix;
        uniform mat4 projectionMatrix;
        uniform float uTime;
        uniform float uSpeed;
        void main() {
          vec3 p = position;
          p.z = (sin(p.x * 4.0 + uTime) * 1.5 + cos(p.y * 2.0 + uTime) * 1.5) * (0.1 + uSpeed * 0.5);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
        }
      `,
      fragment: `
        precision highp float;
        uniform vec3 uColor;
        uniform float uBorderRadius;
        varying vec2 vUv;
        void main() {
          gl_FragColor = vec4(uColor, 1.0);
        }
      `,
      uniforms: {
        uColor: { value: color === 'magenta' ? [1, 0, 0.5] : [1, 0.9, 0] },
        uTime: { value: 0 },
        uSpeed: { value: 0 },
        uBorderRadius: { value: this.borderRadius }
      }
    });

    this.shadow1Mesh = new Mesh(this.gl, {
      geometry: this.geometry,
      program: shadowProgram('magenta')
    });
    this.shadow1Mesh.renderOrder = 1;
    this.shadow1Mesh.setParent(this.scene);

    this.shadow2Mesh = new Mesh(this.gl, {
      geometry: this.geometry,
      program: shadowProgram('yellow')
    });
    this.shadow2Mesh.renderOrder = 0;
    this.shadow2Mesh.setParent(this.scene);
  }

  createTitle() {
    this.title = new Title({
      gl: this.gl,
      plane: this.plane,
      renderer: this.renderer,
      text: this.text,
      textColor: this.textColor,
      font: this.font
    });
    this.title.mesh.setParent(this.scene); // Sibling of plane
  }

  update(scroll: { current: number; last: number }, direction: 'right' | 'left') {
    this.plane.position.x = this.x - scroll.current - this.extra;
    
    // Shadows follow with offset
    this.shadow1Mesh.position.x = this.plane.position.x + 0.15;
    this.shadow2Mesh.position.x = this.plane.position.x + 0.3;
    
    const applyBend = (mesh: Mesh, offsetZ: number) => {
        const x = mesh.position.x;
        const H = this.viewport.width / 2;

        if (this.bend === 0) {
            mesh.position.y = 0;
            mesh.rotation.z = 0;
        } else {
            const B_abs = Math.abs(this.bend);
            const R = (H * H + B_abs * B_abs) / (2 * B_abs);
            const effectiveX = Math.min(Math.abs(x), H);

            const arc = R - Math.sqrt(R * R - effectiveX * effectiveX);
            if (this.bend > 0) {
                mesh.position.y = -arc;
                mesh.rotation.z = -Math.sign(x) * Math.asin(effectiveX / R);
            } else {
                mesh.position.y = arc;
                mesh.rotation.z = Math.sign(x) * Math.asin(effectiveX / R);
            }
        }
        mesh.position.z = offsetZ;

        // Apply slide animation based on hoverValue
        if (mesh === this.plane) {
            const lift = this.hoverValue * 1.5;
            mesh.position.y += lift;
            
            // Info card (Title) slides DOWN from behind
            // Sync its horizontal position and curve logic with the plane
            this.title.mesh.position.x = mesh.position.x;
            this.title.mesh.rotation.z = mesh.rotation.z;
            
            // It should be tucked perfectly behind at hoverValue 0
            // and slide down to be just below the image at hoverValue 1
            const slideDownDistance = this.plane.scale.y * 0.5 + this.title.mesh.scale.y * 0.5;
            this.title.mesh.position.y = mesh.position.y - lift - (this.hoverValue * (slideDownDistance + 0.1));
            
            // Follow the same bend curve (Z-offset)
            this.title.mesh.position.z = mesh.position.z - 0.01; 

            // Sync uniforms for Title mesh
            this.title.mesh.program.uniforms.uAlpha.value = this.hoverValue;
            this.title.mesh.program.uniforms.uTime.value = this.program.uniforms.uTime.value;
            this.title.mesh.program.uniforms.uSpeed.value = this.program.uniforms.uSpeed.value;
        } else if (mesh === this.shadow1Mesh || mesh === this.shadow2Mesh) {
            // Shadows move with the plane
            mesh.position.y += this.hoverValue * 1.5;
        }
    };

    applyBend(this.plane, 0);
    applyBend(this.shadow1Mesh, -0.2);
    applyBend(this.shadow2Mesh, -0.4);

    this.speed = scroll.current - scroll.last;
    this.program.uniforms.uTime.value += 0.04;
    this.program.uniforms.uSpeed.value = this.speed;

    // Sync shadow uniforms for wave animation
    [this.shadow1Mesh, this.shadow2Mesh].forEach(m => {
        m.program.uniforms.uTime.value = this.program.uniforms.uTime.value;
        m.program.uniforms.uSpeed.value = this.program.uniforms.uSpeed.value;
    });

    // Update hover value
    this.hoverValue = lerp(this.hoverValue, this.isHovered ? 1 : 0, 0.1);
    this.program.uniforms.uHover.value = this.hoverValue;

    const planeOffset = this.plane.scale.x / 2;
    const viewportOffset = this.viewport.width / 2;
    this.isBefore = this.plane.position.x + planeOffset < -viewportOffset;
    this.isAfter = this.plane.position.x - planeOffset > viewportOffset;
    
    if (direction === 'right' && this.isBefore) {
      this.extra -= this.widthTotal;
      this.isBefore = this.isAfter = false;
    }
    if (direction === 'left' && this.isAfter) {
      this.extra += this.widthTotal;
      this.isBefore = this.isAfter = false;
    }
  }

  onResize({ screen, viewport }: { screen?: ScreenSize; viewport?: Viewport } = {}) {
    if (screen) this.screen = screen;
    if (viewport) {
      this.viewport = viewport;
      if (this.plane.program.uniforms.uViewportSizes) {
        this.plane.program.uniforms.uViewportSizes.value = [this.viewport.width, this.viewport.height];
      }
    }
    this.scale = this.screen.height / 1500; 
    const h = (this.viewport.height * (650 * this.scale)) / this.screen.height; 
    const w = (this.viewport.width * (500 * this.scale)) / this.screen.width; 
    
    [this.plane, this.shadow1Mesh, this.shadow2Mesh].forEach(m => {
        m.scale.y = h;
        m.scale.x = w;
        if (m.program.uniforms.uPlaneSizes) {
            m.program.uniforms.uPlaneSizes.value = [w, h];
        }
    });

    // Update Title mesh scale
    const titleAspect = 600 / 300; // From canvas dimensions
    // Ensure the info card title is narrower than the image to hide behind curve
    const textWidthScaled = w * 0.85;
    const textHeightScaled = textWidthScaled / titleAspect;
    this.title.mesh.scale.set(textWidthScaled, textHeightScaled, 1);

    this.padding = 1.0; 
    this.width = this.plane.scale.x + this.padding;
    this.widthTotal = this.width * this.length;
    this.x = this.width * this.index;
  }
}

interface AppConfig {
  items?: { image: string; text: string; id: string }[];
  bend?: number;
  textColor?: string;
  borderRadius?: number;
  font?: string;
  scrollSpeed?: number;
  scrollEase?: number;
  onItemClick?: (id: string) => void;
}

class App {
  container: HTMLElement;
  scrollSpeed: number;
  scroll: {
    ease: number;
    current: number;
    target: number;
    last: number;
    position?: number;
  };
  onCheckDebounce: (...args: any[]) => void;
  renderer!: Renderer;
  gl!: GL;
  camera!: Camera;
  scene!: Transform;
  planeGeometry!: Plane;
  medias: Media[] = [];
  mediasImages: { image: string; text: string; id: string }[] = [];
  screen!: { width: number; height: number };
  viewport!: { width: number; height: number };
  raf: number = 0;

  boundOnResize!: () => void;
  boundOnWheel!: (e: Event) => void;
  boundOnTouchDown!: (e: MouseEvent | TouchEvent) => void;
  boundOnTouchMove!: (e: MouseEvent | TouchEvent) => void;
  boundOnTouchUp!: () => void;

  isDown: boolean = false;
  start: number = 0;
  onItemClick?: (id: string) => void;
  raycast!: Raycast;
  mouse: Vec2 = new Vec2();
  clickStartPos: Vec2 = new Vec2();

  constructor(
    container: HTMLElement,
    {
      items,
      bend = 1,
      textColor = '#ffffff',
      borderRadius = 0,
      font = 'bold 30px sans-serif',
      scrollSpeed = 2,
      scrollEase = 0.05,
      onItemClick
    }: AppConfig
  ) {
    document.documentElement.classList.remove('no-js');
    this.container = container;
    this.scrollSpeed = scrollSpeed;
    this.scroll = { ease: scrollEase, current: 0, target: 0, last: 0 };
    this.onCheckDebounce = debounce(this.onCheck.bind(this), 200);
    this.onItemClick = onItemClick;
    this.createRenderer();
    this.createCamera();
    this.createScene();
    this.onResize();
    this.createGeometry();
    this.createMedias(items, bend, textColor, borderRadius, font);
    this.raycast = new Raycast();
    this.update();
    this.addEventListeners();
  }

  createRenderer() {
    try {
      this.renderer = new Renderer({
        alpha: true,
        antialias: true,
        dpr: Math.min(window.devicePixelRatio || 1, 2)
      });
      this.gl = this.renderer.gl;
      if (!this.gl) throw new Error('WebGL context could not be created');
      this.gl.clearColor(0, 0, 0, 0);
      this.container.appendChild(this.renderer.gl.canvas as HTMLCanvasElement);
    } catch (e) {
      console.error('Renderer creation failed:', e);
      throw e; // Re-throw to be caught by constructor or useEffect
    }
  }

  createCamera() {
    this.camera = new Camera(this.gl);
    this.camera.fov = 45;
    this.camera.position.z = 20;
  }

  createScene() {
    this.scene = new Transform();
  }

  createGeometry() {
    this.planeGeometry = new Plane(this.gl, {
      heightSegments: 50,
      widthSegments: 100
    });
  }

  createMedias(
    items: { image: string; text: string; id: string }[] | undefined,
    bend: number = 1,
    textColor: string,
    borderRadius: number,
    font: string
  ) {
    const defaultItems = [
      {
        image: `https://images.unsplash.com/photo-1515562141207-7a88fb0ce33e?q=80&w=800&auto=format&fit=crop`,
        text: 'Dhanak Heritage • PKR 15,000',
        id: '1'
      }
    ];
    const galleryItems = items && items.length ? items : defaultItems;
    this.mediasImages = galleryItems.concat(galleryItems);
    this.medias = this.mediasImages.map((data, index) => {
      return new Media({
        geometry: this.planeGeometry,
        gl: this.gl,
        image: data.image,
        index,
        length: this.mediasImages.length,
        renderer: this.renderer,
        scene: this.scene,
        screen: this.screen,
        text: data.text,
        viewport: this.viewport,
        bend,
        textColor,
        borderRadius,
        font,
        onClick: () => this.onItemClick?.(data.id)
      });
    });
  }

  onTouchDown(e: MouseEvent | TouchEvent) {
    this.isDown = true;
    this.scroll.position = this.scroll.current;
    
    const rect = this.container.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as MouseEvent).clientY;
    
    this.mouse.set(
        ((clientX - rect.left) / rect.width) * 2 - 1,
        ((clientY - rect.top) / rect.height) * -1 * 2 + 1
    );

    this.start = clientX;
    this.clickStartPos.set(clientX, clientY);
  }

  onTouchMove(e: MouseEvent | TouchEvent) {
    const rect = this.container.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as MouseEvent).clientY;

    this.mouse.set(
        ((clientX - rect.left) / rect.width) * 2 - 1,
        ((clientY - rect.top) / rect.height) * -1 * 2 + 1
    );

    if (!this.isDown) return;
    const distance = (this.start - clientX) * (this.scrollSpeed * 0.025);
    this.scroll.target = (this.scroll.position ?? 0) + distance;
  }

  onTouchUp(e: MouseEvent | TouchEvent) {
    this.isDown = false;
    
    const clientX = 'changedTouches' in e ? e.changedTouches[0].clientX : (e as MouseEvent).clientX;
    const clientY = 'changedTouches' in e ? e.changedTouches[0].clientY : (e as MouseEvent).clientY;
    
    if (clientX !== undefined && clientY !== undefined) {
        const dist = Math.hypot(clientX - this.clickStartPos.x, clientY - this.clickStartPos.y);
        if (dist < 30) {
            this.checkClick();
        }
    }
    
    this.onCheck();
  }

  checkClick() {
    this.raycast.castMouse(this.camera, this.mouse);
    
    // Ensure all meshes have up-to-date world matrices before raycasting
    this.medias.forEach(m => m.plane.updateMatrixWorld());
    
    const hits = this.raycast.intersectBounds(this.medias.map(m => m.plane));
    
    if (hits.length > 0) {
        const hitPlane = hits[0];
        const media = this.medias.find(m => m.plane === hitPlane);
        if (media && media.onClick) {
            media.onClick();
        }
    }
  }

  onWheel(e: Event) {
    const wheelEvent = e as WheelEvent;
    const delta = wheelEvent.deltaY || (wheelEvent as any).wheelDelta || (wheelEvent as any).detail;
    this.scroll.target += (delta > 0 ? this.scrollSpeed : -this.scrollSpeed) * 0.2;
    this.onCheckDebounce();
  }

  onCheck() {
    if (!this.medias || !this.medias[0]) return;
    const width = this.medias[0].width;
    const itemIndex = Math.round(Math.abs(this.scroll.target) / width);
    const item = width * itemIndex;
    this.scroll.target = this.scroll.target < 0 ? -item : item;
  }

  onResize() {
    this.screen = {
      width: this.container.clientWidth,
      height: this.container.clientHeight
    };
    this.renderer.setSize(this.screen.width, this.screen.height);
    this.camera.perspective({
      aspect: this.screen.width / this.screen.height
    });
    const fov = (this.camera.fov * Math.PI) / 180;
    const height = 2 * Math.tan(fov / 2) * this.camera.position.z;
    const width = height * this.camera.aspect;
    this.viewport = { width, height };
    if (this.medias) {
      this.medias.forEach(media => media.onResize({ screen: this.screen, viewport: this.viewport }));
    }
  }

  update() {
    if (!this.renderer || !this.gl) return;
    this.scroll.current = lerp(this.scroll.current, this.scroll.target, this.scroll.ease);
    const direction = this.scroll.current > this.scroll.last ? 'right' : 'left';
    if (this.medias) {
      // Raycasting for hover
      this.raycast.castMouse(this.camera, this.mouse);
      const hits = this.raycast.intersectBounds(this.medias.map(m => m.plane));
      this.medias.forEach(media => {
          media.isHovered = hits.includes(media.plane);
      });

      this.medias.forEach(media => media.update(this.scroll, direction));
      
      // Update cursor for hover feedback
      this.container.style.cursor = hits.length > 0 ? 'pointer' : (this.isDown ? 'grabbing' : 'grab');
    }
    this.renderer.render({ scene: this.scene, camera: this.camera });
    this.scroll.last = this.scroll.current;
    this.raf = window.requestAnimationFrame(this.update.bind(this));
  }

  addEventListeners() {
    this.boundOnResize = this.onResize.bind(this);
    this.boundOnWheel = this.onWheel.bind(this);
    this.boundOnTouchDown = this.onTouchDown.bind(this);
    this.boundOnTouchMove = this.onTouchMove.bind(this);
    this.boundOnTouchUp = this.onTouchUp.bind(this);
    window.addEventListener('resize', this.boundOnResize);
    window.addEventListener('mousewheel', this.boundOnWheel);
    window.addEventListener('wheel', this.boundOnWheel);
    this.container.addEventListener('mousedown', this.boundOnTouchDown);
    window.addEventListener('mousemove', this.boundOnTouchMove);
    window.addEventListener('mouseup', this.boundOnTouchUp);
    this.container.addEventListener('touchstart', this.boundOnTouchDown);
    window.addEventListener('touchmove', this.boundOnTouchMove);
    window.addEventListener('touchend', this.boundOnTouchUp);
  }

  destroy() {
    if (this.raf) window.cancelAnimationFrame(this.raf);
    window.removeEventListener('resize', this.boundOnResize);
    window.removeEventListener('mousewheel', this.boundOnWheel);
    window.removeEventListener('wheel', this.boundOnWheel);
    if (this.container) {
      this.container.removeEventListener('mousedown', this.boundOnTouchDown);
      this.container.removeEventListener('touchstart', this.boundOnTouchDown);
    }
    window.removeEventListener('mousemove', this.boundOnTouchMove);
    window.removeEventListener('mouseup', this.boundOnTouchUp);
    window.removeEventListener('touchmove', this.boundOnTouchMove);
    window.removeEventListener('touchend', this.boundOnTouchUp);
    
    if (this.renderer && this.renderer.gl && this.renderer.gl.canvas && this.renderer.gl.canvas.parentNode) {
      this.renderer.gl.canvas.parentNode.removeChild(this.renderer.gl.canvas as HTMLCanvasElement);
    }
    
    // Explicitly nullify to prevent further access
    (this as any).renderer = null;
    (this as any).gl = null;
  }
}

interface CircularGalleryProps {
  items?: { image: string; text: string; id: string }[];
  bend?: number;
  textColor?: string;
  borderRadius?: number;
  font?: string;
  scrollSpeed?: number;
  scrollEase?: number;
  onItemClick?: (id: string) => void;
}

function isWebGLAvailable() {
  try {
    const canvas = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
  } catch (e) {
    return false;
  }
}

export default function CircularGallery({
  items,
  bend = 3,
  textColor = '#1A0A00',
  borderRadius = 0.05,
  font = 'bold 30px sans-serif',
  scrollSpeed = 2,
  scrollEase = 0.05,
  onItemClick
}: CircularGalleryProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hasWebGL, setHasWebGL] = useState(true);

  useEffect(() => {
    if (!isWebGLAvailable()) {
      setHasWebGL(false);
      return;
    }

    if (!containerRef.current) return;
    
    let app: App | null = null;
    try {
      app = new App(containerRef.current, {
        items,
        bend,
        textColor,
        borderRadius,
        font,
        scrollSpeed,
        scrollEase,
        onItemClick
      });
    } catch (e) {
      console.error('Failed to initialize CircularGallery App:', e);
      setHasWebGL(false);
    }
    
    return () => {
      if (app) app.destroy();
    };
  }, [items, bend, textColor, borderRadius, font, scrollSpeed, scrollEase, onItemClick]);

  if (!hasWebGL) {
    return (
      <div className="w-full h-full overflow-y-auto p-4 md:p-8 bg-brand-ivory border-4 border-brand-black">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {(items || []).map((item) => (
            <div 
                key={item.id} 
                onClick={() => onItemClick?.(item.id)}
                className="group cursor-pointer border-2 border-brand-black bg-white shadow-[8px_8px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_#FF0080] hover:-translate-x-1 hover:-translate-y-1 transition-all"
            >
                <div className="aspect-square overflow-hidden border-b-2 border-brand-black">
                    <img 
                        src={item.image} 
                        alt={item.text} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                        referrerPolicy="no-referrer"
                        onError={(e) => { (e.target as HTMLImageElement).src = `https://placehold.co/400x400/FF0080/FFFFFF?text=${encodeURIComponent(item.text.split('•')[0])}`; }}
                    />
                </div>
                <div className="p-3">
                    <p className="text-[10px] font-black uppercase tracking-widest truncate">{item.text}</p>
                </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return <div className="w-full h-full overflow-hidden cursor-grab active:cursor-grabbing" ref={containerRef} />;
}
