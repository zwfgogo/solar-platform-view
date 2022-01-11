import React from 'react';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls';
import './earth.css'

let THREE = require('three');

class Earth extends React.Component {
  constructor(props) {
    super(props);
    const originPosition = {x: 0, y: 0, z: 0};
    this.state = {
      color: props.color ? props.color : 0x44bbbb,
      stationClick: props.stationClick,
      stationDbClick: props.stationDbClick,
      sphericalRadius: 100,
      picMoveCount: props.switchSpeed ? props.switchSpeed * 60 : 0,
      rotateSpeed: props.rotateSpeed ? props.rotateSpeed : 0.001,
      zoom: props.zoom ? props.zoom : 1,
      blintSpeed: props.blintSpeed ? props.blintSpeed : 0,
      stations: props.stations,
      position: props.position ? props.position : originPosition
    }
  }

  componentDidMount() {
    // 先加载图片，用于球面打点
    this.earthImg = document.createElement('img');
    this.earthImg.src = './earth/earth.jpg';
    this.earthImg.onload = () => {
      let earthCanvas = document.createElement('canvas');
      let earthCtx = earthCanvas.getContext('2d');
      earthCanvas.width = this.earthImg.width;
      earthCanvas.height = this.earthImg.height;
      earthCtx.drawImage(this.earthImg, 0, 0, this.earthImg.width, this.earthImg.height);
      this.earthImgData = earthCtx.getImageData(0, 0, this.earthImg.width, this.earthImg.height);
      this.initBasic();
    };
  }

  stationPositionProcess = (stations) => {
    let longitudeArr = [];
    let latitudeArr = [];
    stations.forEach(station => {
      longitudeArr.push(station.position[0]);
      latitudeArr.push(station.position[1]);
    });
    for (let i = 0; i < stations.length; i++) {
      for (let j = 0; j < longitudeArr.length; j++) {
        if (i === j) continue;
        if (Math.abs(stations[i].position[0] - longitudeArr[j]) > 1) {

        }
      }
    }

  };

  /**
   * 初始化
   */
  initBasic = () => {
    this.rotate = true; // 是否自转
    this.hasInitSize = false; // 是否已初始化大小
    this.picGroup = [];
    this.pointGroup = [];
    this.pointGroup2 = [];
    this.picPositionY = new Map();
    this.picDirection = new Map();
    this.picObjMap = new Map();
    this.picSpeed = new Map();
    this.currentPicIndex = 0;
    this.currentPicCount = this.state.picMoveCount;
    this.earthParticles = new THREE.Object3D();
    this.dotTexture = new THREE.TextureLoader().load('./earth/dot.png');
    this.faceTexture = new THREE.TextureLoader().load('./earth/face.png');
    // 包裹画布dom
    this.dom = document.getElementById("canvas-frame");
    // 初始化场景
    this.scene = new THREE.Scene();
    // 初始化相机
    this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 10000);
    // 设置相机位置
    this.camera.position.set(0, 0, 280 / this.state.zoom);
    this.renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true
    });
    // 初始化控制器
    this.initControls();
    // 球面打点
    this.createEarthParticles(this.dotTexture, 1, true);
    // 球面填充
    this.createEarthParticles(this.faceTexture, 0.5, false);
    // 电站标记
    this.createStations();
    // 点击事件
    this.clickListener();
    // 开始绘制
    this.animate();
    // 添加到页面中
    this.dom.appendChild(this.renderer.domElement);
    // 设置大小
    // this.resize();
    window.addEventListener('resize', this.resize);
  };

  /**
   * 初始化控制器
   */
  initControls = () => {
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enabled = true; // 鼠标控制是否可用

    // 是否自动旋转
    this.controls.autoRotate = true;
    this.controls.autoRotateSpeed = 0.05;

    // 是否可旋转，旋转速度(鼠标左键)
    this.controls.enableRotate = true;
    this.controls.rotateSpeed = 0.3;

    //controls.target = new THREE.Vector();//摄像机聚焦到某一个点
    // 最大最小相机移动距离(景深相机)
    // controls.minDistance = 10;
    // controls.maxDistance = 40;

    // 最大仰视角和俯视角
    this.controls.minPolarAngle = Math.PI / 2.4; // 4是45度视角
    this.controls.maxPolarAngle = Math.PI / 2.4; // 2.4是75度视角

    // 惯性滑动，滑动大小默认0.25
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.25;

    // 是否可平移，默认移动速度为7px
    this.controls.enablePan = false;
    this.controls.panSpeed = 0.5;
    //controls.screenSpacePanning	= true;

    // 滚轮缩放控制
    this.controls.enableZoom = false;
    this.controls.zoomSpeed = 1.5;

    // 水平方向视角限制
    //controls.minAzimuthAngle = -Math.PI/4;
    //controls.maxAzimuthAngle = Math.PI/4;

    // 避免出现边框，移除掉tabindex属性
    this.renderer.domElement.removeAttribute("tabindex");
  };

  /**
   * 创建电站标记
   */
  createStations = () => {
    // 储能电站的标记图片
    let storageObj = this.getStationPic('./earth/battery.png', 150, 259);
    // 光伏电站的标记图片
    let pvObj = this.getStationPic('./earth/pv.png', 292, 258);
    // 微电网电站的标记图片
    let mgObj = this.getStationPic('./earth/mg.png', 244, 244);
    // 辅助服务电站的标记图片
    let ssObj = this.getStationPic('./earth/ss.png', 160, 252);
    // 光储电站的标记图片
    let ipsObj = this.getStationPic('./earth/ips.png', 250, 254);
    for (let i = 0, length = this.state.stations.length; i < length; i++) {
      const position = this.createPosition(this.state.stations[i].position, this.state.stations[i].title);
      position.x += this.state.position.x;
      position.y += this.state.position.y;
      position.z += this.state.position.z;
      if (this.state.stations[i].stationType === 'Storage') {
        this.createOneStation(position, this.state.stations[i], storageObj.clone(), 0x3bfb8e);
      } else if (this.state.stations[i].stationType === 'Solar') {
        this.createOneStation(position, this.state.stations[i], pvObj.clone(), 0x65b7ff);
      } else if (this.state.stations[i].stationType === 'Microgrid') {
        this.createOneStation(position, this.state.stations[i], mgObj.clone(), 0x99da6b);
      } else if (this.state.stations[i].stationType === 'SupportingService') {
        this.createOneStation(position, this.state.stations[i], ssObj.clone(), 0xbad168);
      } else if (this.state.stations[i].stationType === 'IntegrationPhotovoltaicStorage') {
        this.createOneStation(position, this.state.stations[i], ipsObj.clone(), 0x7bd3c2);
      } else if (this.state.stations[i].stationType === 'SolarStorage') {
        this.createOneStation(position, this.state.stations[i], ipsObj.clone(), 0x7bd3c2);
      } else if (this.state.stations[i].stationType === 'SupportingService') {
        this.createOneStation(position, this.state.stations[i], storageObj.clone(), 0x7bd3c2);
      }
    }
  };

  /**
   *
   */
  getStationPic = (url, width, height) => {
    let picTexture = new THREE.TextureLoader().load(url);
    let picMaterial = new THREE.MeshBasicMaterial({
      map: picTexture,
      transparent: true,
      side: THREE.FrontSide
    });
    let picGeometry = new THREE.PlaneGeometry(width, height);
    let picPlane = new THREE.Mesh(picGeometry, picMaterial);
    let picObj = new THREE.Mesh();
    picObj.add(picPlane);
    return picObj;
  };

  /**
   * 新建某一个电站
   */
  createOneStation = (position, obj, picObj, color) => {
    // 图片对象添加到场景中
    picObj.scale.set(0.02, 0.02, 0.02);
    picObj.position.copy(position);
    picObj.position.y += 8;
    this.picObjMap.set(picObj.children[0].id, obj);
    this.picPositionY.set(picObj.id, picObj.position.y);
    this.picDirection.set(picObj.id, true);
    this.picSpeed.set(picObj.id, this.randomNum(0.04, 0.06));
    this.picGroup.push(picObj);
    this.scene.add(picObj);

    //锚点的第一个圆圈
    let radius = 1;
    let segments = 64;
    let material = new THREE.LineBasicMaterial({color: color});
    let geometry = new THREE.CircleGeometry(radius, segments);
    geometry.vertices.shift();
    let line = new THREE.Line(geometry, material);
    line.material.transparent = true;
    let lineLoop = new THREE.LineLoop(geometry, material);
    line.add(lineLoop);
    let vector3 = new THREE.Vector3(0, 0, 0);
    line.position.copy(position);
    line.lookAt(vector3);
    this.pointGroup.push(line);
    this.scene.add(line);

    //锚点的第二个圆圈
    let material2 = new THREE.LineBasicMaterial({color: color});
    let geometry2 = new THREE.CircleGeometry(radius, segments);
    geometry2.vertices.shift();
    let line2 = new THREE.Line(geometry2, material2);
    line2.material.transparent = true;
    line2.scale.set(1.8, 1.8, 1.8);
    line2.material.opacity = 0.5;
    let lineLoop2 = new THREE.LineLoop(geometry2, material2);
    line2.add(lineLoop2);
    line2.position.copy(position);
    line2.lookAt(vector3);
    this.pointGroup2.push(line2);
    this.scene.add(line2);
  };

  /**
   * 获得随机数
   */
  randomNum = (min, max) => {
    return Math.random() * (max - min) + min;
  };

  /**
   * 球面打点
   * @param dotTexture 贴图
   * @param opacity 透明度（0.5是分界点）
   * @param needFill 是否需要填充
   */
  createEarthParticles = (dotTexture, opacity, needFill) => {
    let positions = [];
    let materials = [];
    let sizes = [];
    for (let i = 0; i < 2; i++) {
      positions[i] = {
        positions: []
      };
      sizes[i] = {
        sizes: []
      };
      let mat = new THREE.PointsMaterial();
      mat.size = 5;
      // 球面颜色
      mat.color = new THREE.Color(this.state.color); //0x03d98e
      // 球面形状
      mat.map = dotTexture;
      mat.depthWrite = false;
      mat.transparent = true;
      mat.opacity = 0;
      mat.side = THREE.FrontSide;
      // mat.blending = THREE.AdditiveBlending
      mat.blending = THREE.NormalBlending;
      let n = i / 2;
      mat.t_ = n * Math.PI * 2;
      // 球面变化速度
      mat.speed_ = this.state.blintSpeed;
      //mat.min_ = .2 * Math.random() + .5
      mat.min_ = 0.5;
      mat.delta_ = .1 * Math.random() + .1;
      mat.opacity_coef_ = opacity;
      materials.push(mat)
    }
    const spherical = new THREE.Spherical();
    spherical.radius = this.state.sphericalRadius;
    const step = 250;
    for (let i = 0; i < step; i++) {
      let vec = new THREE.Vector3();
      let radians = step * (1 - Math.sin(i / step * Math.PI)) / step + .5; // 每个纬线圈内的角度均分
      for (let j = 0; j < step; j += radians) {
        let c = j / step; // 底图上的横向百分比
        let f = i / step; // 底图上的纵向百分比
        let index = Math.floor(2 * Math.random());
        let pos = positions[index];
        let size = sizes[index];
        if ((needFill && this.isLandByUV(c, f)) || (!needFill && !this.isLandByUV(c, f))) { // 根据横纵百分比判断在底图中的像素值
          spherical.theta = c * Math.PI * 2 - Math.PI / 2; // 横纵百分比转换为theta和phi夹角
          spherical.phi = f * Math.PI; // 横纵百分比转换为theta和phi夹角
          vec.setFromSpherical(spherical); // 夹角转换为世界坐标
          pos.positions.push(vec.x + this.state.position.x);
          pos.positions.push(vec.y + this.state.position.y);
          pos.positions.push(vec.z + this.state.position.z);
          if (j % 3 === 0) {
            size.sizes.push(6.0)
          }
        }
      }
    }
    for (let i = 0; i < positions.length; i++) {
      let pos = positions[i];
      let size = sizes[i];
      let bufferGeom = new THREE.BufferGeometry();
      let typedArr1 = new Float32Array(pos.positions.length);
      let typedArr2 = new Float32Array(size.sizes.length);
      for (let j = 0; j < pos.positions.length; j++) {
        typedArr1[j] = pos.positions[j];
      }
      for (let j = 0; j < size.sizes.length; j++) {
        typedArr2[j] = size.sizes[j];
      }
      bufferGeom.setAttribute("position", new THREE.BufferAttribute(typedArr1, 3));
      bufferGeom.setAttribute('size', new THREE.BufferAttribute(typedArr2, 1));
      bufferGeom.computeBoundingSphere();
      let particle = new THREE.Points(bufferGeom, materials[i]);
      this.updateEarthParticles(particle);
      this.earthParticles.add(particle);
    }
    this.scene.add(this.earthParticles);
  };

  /**
   * 球面打点的更新
   */
  updateEarthParticles = (particle) => {
    let material = particle.material;
    material.t_ += material.speed_;
    material.opacity = (Math.sin(material.t_) * material.delta_ + material.min_) * material.opacity_coef_;
    material.needsUpdate = false;
  };

  /**
   * 根据经纬度生成坐标
   */
  createPosition = (lnglat, title) => {
    let spherical = new THREE.Spherical();
    spherical.radius = this.state.sphericalRadius;
    let lng = lnglat[0];
    let lat = lnglat[1];
    if (title === '江苏移动数据中心储能管理系统') {
      lat += 6
    }
    if (title === '新能源微网与主动配电网运维管理系统') {
      lng -= 6
    }
    // const phi = (180 - lng) * (Math.PI / 180)
    // const theta = (90 + lat) * (Math.PI / 180)
    spherical.phi = (90 - lat) * (Math.PI / 180);
    spherical.theta = (lng + 90) * (Math.PI / 180);
    let position = new THREE.Vector3();
    position.setFromSpherical(spherical);
    return position;
  };

  /**
   * 生成圆点的判断（true要生成，false不生成）
   */
  isLandByUV = (c, f) => {
    let n = parseInt(this.earthImg.width * c); // 根据横纵百分比计算图象坐标系中的坐标
    let o = parseInt(this.earthImg.height * f); // 根据横纵百分比计算图象坐标系中的坐标
    return 0 === this.earthImgData.data[4 * (o * this.earthImgData.width + n)] // 查找底图中对应像素点的rgba值并判断
  };

  /**
   * 选择某个电站图片的操作
   */
  selectPic = (pic) => {
    if (this.currentPic !== pic) {
      // 如果之前有点击放大的，则恢复原有大小
      if (this.currentPic) {
        this.currentPic.scale.set(1, 1, 1);
        // this.currentPic.material.color.set(this.currentPic.material.emissive);
      }
      // 记录当前点击的坐标，并将其放大
      this.currentPic = pic;
      // this.currentPic.material.color.set(0xff0000);
      this.currentPic.scale.set(1.7, 1.7, 1.7);
      if (this.state.stationClick) {
        this.state.stationClick(this.picObjMap.get(this.currentPic.id));
      }
    }
    this.currentPicCount = 0;
  };

  /**
   * 电站图片的轮播
   */
  picCarousel = () => {
    if (++this.currentPicCount >= this.state.picMoveCount) {
      if (++this.currentPicIndex >= this.picGroup.length) {
        this.currentPicIndex = 0;
      }
      this.selectPic(this.picGroup[this.currentPicIndex].children[0]);
    }
  };

  /**
   * 电站图片的动画
   */
  picMove = () => {
    const maxDistance = 1.5;
    this.picGroup.forEach(picObj => {
      picObj.lookAt(this.camera.position);
      let speed = this.picSpeed.get(picObj.id);
      let positionNow = picObj.position.y;
      let positionY = this.picPositionY.get(picObj.id);
      if (this.picDirection.get(picObj.id)) {
        positionNow += speed;
        if (positionNow - positionY >= maxDistance) {
          positionNow = positionY + maxDistance;
          this.picDirection.set(picObj.id, false);
        }
      } else {
        positionNow -= speed;
        if (positionY - positionNow >= maxDistance) {
          positionNow = positionY - maxDistance;
          this.picDirection.set(picObj.id, true);
        }
      }
      picObj.position.y = positionNow;
    });
  };

  /**
   * 执行锚点的动画
   */
  pointMove = () => {
    this.onePointMove(this.pointGroup);
    this.onePointMove(this.pointGroup2);
    // this.onePointMove(this.pointLoopGroup);
    // this.onePointMove(this.pointLoopGroup2);
  };

  /**
   * 某个锚点的动画
   */
  onePointMove = (group) => {
    const maxMultiple = 3;
    const speed = 0.02;
    group.forEach(point => {
      if (point.scale.x >= maxMultiple) {
        point.scale.set(1, 1, 1);
        point.material.opacity = 1;
      } else {
        point.scale.set(point.scale.x + speed, point.scale.y + speed, point.scale.z + speed);
        point.material.opacity -= speed / 1.5;
      }
    });
  };

  /**
   * 点击事件绑定
   */
  clickListener = () => {
    this.picObjects = [];
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    this.scene.children.forEach(child => {
      // 根据需求判断哪些加入objects,也可以在生成object的时候push进objects
      if (child instanceof THREE.Mesh && this.picPositionY.has(child.id)) {
        this.picObjects.push(child);
      }
    });
    // 监听全局点击事件,通过ray检测选中哪一个object
    document.addEventListener("mousedown", (event) => {
      event.preventDefault();
      //鼠标左键
      if (event.button === 0) {
        this.mouse.x = ((event.clientX - this.renderer.domElement.getBoundingClientRect().left) / this.renderer.domElement.clientWidth) * 2 - 1;
        this.mouse.y = -((event.clientY - this.renderer.domElement.getBoundingClientRect().top) / this.renderer.domElement.clientHeight) * 2 + 1;
        this.raycaster.setFromCamera(this.mouse, this.camera);
        let intersects = this.raycaster.intersectObjects(this.picObjects, true);
        if (intersects.length > 0) {
          this.selectPic(intersects[0].object);
        }
        // 鼠标右键
      } else if (event.button === 2) {
        this.rotate = !this.rotate;
      }
    }, false);
  };

  /**
   * 重置图形大小
   */
  resize = () => {
    if (this.dom.clientWidth && this.dom.clientHeight) {
      this.renderer.setSize(this.dom.clientWidth, this.dom.clientHeight);
      this.camera.aspect = this.dom.clientWidth / this.dom.clientHeight;
      this.camera.updateProjectionMatrix();
    }
  };

  /**
   * 初始化图形大小
   */
  initSize = () => {
    if (!this.hasInitSize) {
      this.resize();
      this.hasInitSize = true;
    }
  };

  /**
   * 画布更新
   */
  animate = () => {
    this.initSize();
    if (this.rotate) {
      this.scene.rotation.y += this.state.rotateSpeed;
      this.controls.update();
    }
    this.picMove();
    this.pointMove();
    if (this.state.picMoveCount !== 0) {
      this.picCarousel();
    }
    this.renderer.render(this.scene, this.camera);
    requestAnimationFrame(this.animate);
  };

  render() {
    return (
      <div id='canvas-frame'/>
    )
  }
}

export default Earth