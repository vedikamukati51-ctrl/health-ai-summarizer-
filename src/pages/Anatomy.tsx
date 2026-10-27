import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import * as THREE from "three";
import DemoPatient from "../components/DemoPatient";
import { useHealthData } from "../context/HealthDataContext";
import { useLanguage } from "../context/LanguageContext";

interface PainCoordinates {
  internal: { x: number; y: number; z: number };
  surface: { x: number; y: number; z: number };
  pointerFrom: { x: number; y: number; z: number };
  bestView: "front" | "back" | "side";
}

interface AnatomicTarget {
  id: string;
  anomalyName: string;
  patientValue: string;
  status: string;
  systemName: string;
  organKey: "kidneys" | "veins" | "pancreas" | "spine" | "heart";
  affectedOrgan: string;
  affectedTissue: string;
  affectedVein: string;
  affectedMuscle: string;
  biologicalRole: string;
  clinicalImpact: string;
  painTitle: string;
  painZone: string;
  painCoords: PainCoordinates;
  specialistLink: string;
  specialistTitle: string;
}

const ANATOMIC_TARGETS: AnatomicTarget[] = [
  {
    id: "target-creatinine",
    anomalyName: "Elevated Creatinine",
    patientValue: "1.28 mg/dL",
    status: "ATTENTION",
    systemName: "Urinary & Renal System",
    organKey: "kidneys",
    affectedOrgan: "Left & Right Kidneys (Renal Cortex & Glomeruli)",
    affectedTissue: "Glomerular Filtration Membrane & Nephron Tubules",
    affectedVein: "Renal Artery, Renal Vein & Inferior Vena Cava",
    affectedMuscle: "Detrusor Smooth Muscle & Renal Pelvis",
    biologicalRole:
      "Kidneys continuously filter metabolic nitrogenous waste (creatinine) out of bloodstream through 1 million nephron units.",
    clinicalImpact:
      "Creatinine trending up to 1.28 mg/dL indicates kidneys are under mild filtration workload, often exacerbated by dehydration or intense muscle strain.",
    painTitle: "Posterior Flank & Costovertebral Angle (CVA)",
    painZone: "Dull aching in lower posterior flank / mid-back beneath 12th rib, fluid puffiness under eyes.",
    painCoords: {
      internal: { x: 0.38, y: -0.06, z: -0.12 },
      surface: { x: 0.58, y: -0.06, z: -0.28 },
      pointerFrom: { x: 1.05, y: 0.15, z: -0.72 },
      bestView: "back",
    },
    specialistLink: "/specialists?problem=creatinine",
    specialistTitle: "Consult Nephrologist",
  },
  {
    id: "target-hemoglobin",
    anomalyName: "Low Hemoglobin (Anemia)",
    patientValue: "11.4 g/dL",
    status: "LOW",
    systemName: "Circulatory & Vascular System",
    organKey: "veins",
    affectedOrgan: "Red Bone Marrow (Pelvis & Spine) & Systemic Microvasculature",
    affectedTissue: "Erythroid Precursor Cells & Capillary Endothelium",
    affectedVein: "Systemic Capillary Network & Venous Circulation",
    affectedMuscle: "Skeletal Myocytes (Oxygen-Deprived Muscle Fibers)",
    biologicalRole:
      "Hemoglobin in red blood cells binds oxygen in pulmonary capillaries and delivers it through systemic arteries and veins to all working tissues.",
    clinicalImpact:
      "A level of 11.4 g/dL restricts oxygen perfusion to muscles and brain tissue, triggering early anaerobic metabolism and cellular fatigue.",
    painTitle: "Peripheral Capillaries & Skeletal Muscle Hypoxia",
    painZone: "Heavy, sluggish sensation in leg muscles during stairs, tension headaches, cold fingers and toes.",
    painCoords: {
      internal: { x: 0.22, y: -0.12, z: 0.08 },
      surface: { x: 0.42, y: -0.12, z: 0.34 },
      pointerFrom: { x: 0.85, y: 0.08, z: 0.95 },
      bestView: "front",
    },
    specialistLink: "/specialists?problem=hemoglobin",
    specialistTitle: "Consult Hematologist",
  },
  {
    id: "target-glucose",
    anomalyName: "Borderline Fasting Glucose",
    patientValue: "108 mg/dL",
    status: "BORDERLINE",
    systemName: "Endocrine & Metabolic System",
    organKey: "pancreas",
    affectedOrgan: "Pancreas (Islets of Langerhans Beta Cells)",
    affectedTissue: "Hepatic Glycogen Parenchyma & Muscle GLUT4 Receptors",
    affectedVein: "Hepatic Portal Vein & Mesenteric Venous Plexus",
    affectedMuscle: "Large Skeletal Muscle Groups (Quadriceps & Hamstrings)",
    biologicalRole:
      "The pancreas secretes insulin to prompt liver, muscle, and adipose tissues to absorb circulating glucose following meals.",
    clinicalImpact:
      "At 108 mg/dL, early insulin resistance means peripheral muscle tissue requires higher insulin concentrations to pull glucose out of circulation.",
    painTitle: "Transpyloric Epigastrium (Upper Abdomen)",
    painZone: "Post-prandial afternoon brain fog, sudden energy slumps, mild epigastric bloating after meals.",
    painCoords: {
      internal: { x: 0.04, y: 0.14, z: 0.06 },
      surface: { x: 0.04, y: 0.14, z: 0.42 },
      pointerFrom: { x: 0.12, y: 0.32, z: 1.15 },
      bestView: "front",
    },
    specialistLink: "/specialists?problem=glucose",
    specialistTitle: "Consult Endocrinologist",
  },
  {
    id: "target-vitamind",
    anomalyName: "Low Vitamin D3 Deficiency",
    patientValue: "18.2 ng/mL",
    status: "LOW",
    systemName: "Skeletal & Musculoskeletal System",
    organKey: "spine",
    affectedOrgan: "Lumbar Vertebrae, Femoral Neck & Pelvic Girdle",
    affectedTissue: "Trabecular Bone Matrix & Articular Cartilage",
    affectedVein: "Intraosseous Bone Marrow Venous Sinuses",
    affectedMuscle: "Paraspinal Postural Muscles & Myofascial Junctions",
    biologicalRole:
      "Vitamin D regulates intestinal calcium absorption and bone matrix mineralization, while maintaining neuromuscular contraction strength.",
    clinicalImpact:
      "At 18.2 ng/mL (clinical deficiency), bone turnover accelerates and muscle fiber calcium signaling weakens, causing diffuse skeletal aches.",
    painTitle: "Lumbar Spine L4-L5 & Sacroiliac Axis",
    painZone: "Deep aching across lower lumbar spine, morning stiffness in weight-bearing joints upon waking.",
    painCoords: {
      internal: { x: 0, y: -0.12, z: -0.22 },
      surface: { x: 0, y: -0.12, z: -0.44 },
      pointerFrom: { x: 0, y: 0.10, z: -1.25 },
      bestView: "back",
    },
    specialistLink: "/specialists?problem=vitamin",
    specialistTitle: "Consult Orthopedist",
  },
  {
    id: "target-cholesterol",
    anomalyName: "Borderline LDL Cholesterol",
    patientValue: "136 mg/dL",
    status: "BORDERLINE",
    systemName: "Coronary & Cardiac Vessels",
    organKey: "heart",
    affectedOrgan: "Heart (Left Ventricle & Myocardial Wall)",
    affectedTissue: "Coronary Intimal Endothelium & Subendothelial Space",
    affectedVein: "Left Anterior Descending (LAD) Coronary Artery & Aorta",
    affectedMuscle: "Cardiac Myocardium",
    biologicalRole:
      "Coronary vessels deliver oxygenated blood continuously to the myocardium. Excess circulating LDL can undergo oxidation inside arterial walls.",
    clinicalImpact:
      "At 136 mg/dL, borderline LDL increases the propensity for microscopic lipid infiltration along endothelial walls over time.",
    painTitle: "Substernal Precordium & Anterior Chest",
    painZone: "Vague substernal chest tightness during intense cardiovascular exertion, slower exercise recovery.",
    painCoords: {
      internal: { x: -0.09, y: 0.44, z: 0.18 },
      surface: { x: -0.10, y: 0.45, z: 0.46 },
      pointerFrom: { x: -0.25, y: 0.62, z: 1.25 },
      bestView: "front",
    },
    specialistLink: "/specialists?problem=cholesterol",
    specialistTitle: "Consult Cardiologist",
  },
];

export default function Anatomy() {
  const mountRef = useRef<HTMLDivElement>(null);
  const { reports, anomalies, trendAnomalies, hasReports, activePatientName } = useHealthData();
  const { t } = useLanguage();

  // 1. FILTER ONLY ORGANS AFFECTED AS PER MEDICAL DIAGNOSTIC REPORT
  const activeTargets = useMemo(() => {
    if (!hasReports || reports.length === 0) return [];

    const allAnomalyTexts = [
      ...anomalies.map((a) => `${a.paramName} ${a.explanation || ""}`.toLowerCase()),
      ...trendAnomalies.map((tr) => `${tr.key} ${tr.name} ${tr.label}`.toLowerCase()),
    ];

    if (allAnomalyTexts.length === 0) {
      return [];
    }

    return ANATOMIC_TARGETS.filter((target) => {
      if (target.id === "target-creatinine") {
        return allAnomalyTexts.some((text) => text.includes("creatinine") || text.includes("kidney") || text.includes("renal"));
      }
      if (target.id === "target-hemoglobin") {
        return allAnomalyTexts.some((text) => text.includes("hemoglobin") || text.includes("anemia") || text.includes("rbc") || text.includes("iron"));
      }
      if (target.id === "target-glucose") {
        return allAnomalyTexts.some((text) => text.includes("glucose") || text.includes("sugar") || text.includes("hba1c") || text.includes("diabetes"));
      }
      if (target.id === "target-vitamind") {
        return allAnomalyTexts.some((text) => text.includes("vitamin") || text.includes("vit d") || text.includes("calcium") || text.includes("bone"));
      }
      if (target.id === "target-cholesterol") {
        return allAnomalyTexts.some((text) => text.includes("cholesterol") || text.includes("lipid") || text.includes("ldl") || text.includes("triglyceride"));
      }
      return false;
    }).map((target) => {
      const matched = trendAnomalies.find((tr) => {
        const k = tr.key.toLowerCase();
        if (target.id.includes("creatinine") && k.includes("creatinine")) return true;
        if (target.id.includes("hemoglobin") && k.includes("hemoglobin")) return true;
        if (target.id.includes("glucose") && (k.includes("glucose") || k.includes("sugar"))) return true;
        if (target.id.includes("vitamind") && k.includes("vitamin")) return true;
        if (target.id.includes("cholesterol") && k.includes("cholesterol")) return true;
        return false;
      });

      if (matched) {
        return {
          ...target,
          patientValue: `${matched.value} ${matched.unit || ""}`.trim(),
          status: matched.status || target.status,
        };
      }
      return target;
    });
  }, [hasReports, reports, anomalies, trendAnomalies]);

  const [selectedTargetId, setSelectedTargetId] = useState<string>("");

  useEffect(() => {
    if (activeTargets.length > 0) {
      if (!activeTargets.some((target) => target.id === selectedTargetId)) {
        setSelectedTargetId(activeTargets[0].id);
      }
    } else {
      setSelectedTargetId("");
    }
  }, [activeTargets, selectedTargetId]);

  const currentTarget = activeTargets.find((target) => target.id === selectedTargetId) || activeTargets[0];

  const [autoRotate, setAutoRotate] = useState<boolean>(false);
  const [showVessels, setShowVessels] = useState<boolean>(true);
  const [showPainPointer, setShowPainPointer] = useState<boolean>(true);
  const [bodyMode, setBodyMode] = useState<"glass" | "wireframe" | "hidden">("glass");

  // ThreeJS references
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const mainRigRef = useRef<THREE.Group | null>(null);

  // Set camera angle preset
  const setViewAngle = (view: "front" | "back" | "side" | "organ") => {
    if (!cameraRef.current || !mainRigRef.current) return;
    const camera = cameraRef.current;
    const rig = mainRigRef.current;

    rig.rotation.set(0, 0, 0);

    if (view === "front") {
      camera.position.set(0, 0.15, 3.8);
    } else if (view === "back") {
      camera.position.set(0, 0.15, -3.8);
    } else if (view === "side") {
      camera.position.set(3.4, 0.2, 1.2);
    } else if (view === "organ") {
      const targetY = currentTarget?.painCoords.internal.y || 0.1;
      camera.position.set(0, targetY, 2.2);
    }
    camera.lookAt(0, 0.1, 0);
  };

  useEffect(() => {
    if (!mountRef.current || !currentTarget) return;
    const container = mountRef.current;
    const width = container.clientWidth || 600;
    const height = container.clientHeight || 540;

    // 1. Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x0a0e17);

    // 2. Camera setup - frames both the full upper body and internal organ
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    // Auto-orient based on bestView for the selected organ
    if (currentTarget.painCoords.bestView === "back") {
      camera.position.set(0, 0.15, -3.8);
    } else {
      camera.position.set(0, 0.15, 3.8);
    }
    camera.lookAt(0, 0.1, 0);
    cameraRef.current = camera;

    // 3. Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    rendererRef.current = renderer;
    container.innerHTML = "";
    container.appendChild(renderer.domElement);

    // 4. Studio Medical Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0x70b0ff, 1.4);
    dirLight1.position.set(4, 5, 4);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0xff6060, 1.0);
    dirLight2.position.set(-4, -2, -2);
    scene.add(dirLight2);

    const pointLight = new THREE.PointLight(0xffffff, 1.2, 15);
    pointLight.position.set(0, 1.5, 3.0);
    scene.add(pointLight);

    // Main Rig that holds Body + Organ + Pain Pointer so they rotate together
    const mainRig = new THREE.Group();
    mainRigRef.current = mainRig;
    scene.add(mainRig);

    // =================================================================
    // 5. TRANSLUCENT HOLOGRAPHIC HUMAN BODY STRUCTURE (MANNEQUIN)
    // =================================================================
    if (bodyMode !== "hidden") {
      const bodyGroup = new THREE.Group();

      const glassMat = new THREE.MeshStandardMaterial({
        color: 0x38bdf8,
        transparent: true,
        opacity: bodyMode === "glass" ? 0.15 : 0.04,
        roughness: 0.25,
        metalness: 0.2,
        depthWrite: false,
        side: THREE.DoubleSide,
      });

      const wireMat = new THREE.MeshBasicMaterial({
        color: 0x0284c7,
        wireframe: true,
        transparent: true,
        opacity: bodyMode === "wireframe" ? 0.35 : 0.08,
      });

      // Head & Cranium
      const headGeo = new THREE.SphereGeometry(0.36, 28, 28);
      headGeo.scale(0.85, 1.15, 0.95);
      const headMesh = new THREE.Mesh(headGeo, glassMat);
      headMesh.position.set(0, 1.48, 0);
      bodyGroup.add(headMesh);
      const headWire = new THREE.Mesh(headGeo, wireMat);
      headWire.position.copy(headMesh.position);
      bodyGroup.add(headWire);

      // Neck
      const neckGeo = new THREE.CylinderGeometry(0.16, 0.19, 0.32, 20);
      const neckMesh = new THREE.Mesh(neckGeo, glassMat);
      neckMesh.position.set(0, 1.06, 0);
      bodyGroup.add(neckMesh);

      // Shoulders & Clavicle Bar
      const shoulderGeo = new THREE.CylinderGeometry(0.82, 0.76, 0.24, 24);
      shoulderGeo.scale(1.35, 1.0, 0.65);
      const shoulderMesh = new THREE.Mesh(shoulderGeo, glassMat);
      shoulderMesh.position.set(0, 0.88, 0);
      bodyGroup.add(shoulderMesh);

      // Thorax / Chest & Ribcage
      const chestGeo = new THREE.CylinderGeometry(0.68, 0.60, 0.85, 28);
      chestGeo.scale(1.18, 1.0, 0.72);
      const chestMesh = new THREE.Mesh(chestGeo, glassMat);
      chestMesh.position.set(0, 0.48, 0);
      bodyGroup.add(chestMesh);
      const chestWire = new THREE.Mesh(chestGeo, wireMat);
      chestWire.position.copy(chestMesh.position);
      bodyGroup.add(chestWire);

      // Rib Contours (5 anatomical rings for thoracic reference)
      for (let r = 0; r < 5; r++) {
        const ribGeo = new THREE.TorusGeometry(0.55 - r * 0.02, 0.012, 10, 28, Math.PI * 1.85);
        ribGeo.scale(1.18, 0.72, 1);
        const ribMat = new THREE.MeshBasicMaterial({
          color: 0x7dd3fc,
          transparent: true,
          opacity: 0.22,
        });
        const ribMesh = new THREE.Mesh(ribGeo, ribMat);
        ribMesh.position.set(0, 0.74 - r * 0.13, 0);
        ribMesh.rotation.x = Math.PI / 2;
        ribMesh.rotation.z = Math.PI * 0.075;
        bodyGroup.add(ribMesh);
      }

      // Abdominal Core & Waist
      const abdomenGeo = new THREE.CylinderGeometry(0.56, 0.52, 0.60, 28);
      abdomenGeo.scale(1.08, 1.0, 0.70);
      const abdomenMesh = new THREE.Mesh(abdomenGeo, glassMat);
      abdomenMesh.position.set(0, -0.18, 0);
      bodyGroup.add(abdomenMesh);
      const abdomenWire = new THREE.Mesh(abdomenGeo, wireMat);
      abdomenWire.position.copy(abdomenMesh.position);
      bodyGroup.add(abdomenWire);

      // Pelvis / Hips
      const pelvisGeo = new THREE.CylinderGeometry(0.52, 0.60, 0.48, 28);
      pelvisGeo.scale(1.16, 1.0, 0.74);
      const pelvisMesh = new THREE.Mesh(pelvisGeo, glassMat);
      pelvisMesh.position.set(0, -0.66, 0);
      bodyGroup.add(pelvisMesh);

      // Arms (Silhouettes)
      const armGeo = new THREE.CylinderGeometry(0.12, 0.09, 1.15, 14);
      const leftArm = new THREE.Mesh(armGeo, glassMat);
      leftArm.position.set(-0.95, 0.35, 0);
      leftArm.rotation.z = -0.18;
      bodyGroup.add(leftArm);

      const rightArm = new THREE.Mesh(armGeo, glassMat);
      rightArm.position.set(0.95, 0.35, 0);
      rightArm.rotation.z = 0.18;
      bodyGroup.add(rightArm);

      // Upper Thighs
      const thighGeo = new THREE.CylinderGeometry(0.24, 0.18, 0.95, 16);
      const leftThigh = new THREE.Mesh(thighGeo, glassMat);
      leftThigh.position.set(-0.35, -1.30, 0);
      bodyGroup.add(leftThigh);

      const rightThigh = new THREE.Mesh(thighGeo, glassMat);
      rightThigh.position.set(0.35, -1.30, 0);
      bodyGroup.add(rightThigh);

      mainRig.add(bodyGroup);
    }

    // =================================================================
    // 6. INTERNAL ORGAN MESH (PLACED AT ANATOMICAL COORDINATES INSIDE BODY)
    // =================================================================
    const organGroup = new THREE.Group();

    if (currentTarget.organKey === "kidneys") {
      // SITUATED INSIDE POSTERIOR ABDOMINAL CAVITY (RETROPERITONEUM)
      organGroup.position.set(0, -0.06, -0.12);

      const kidneyMat = new THREE.MeshStandardMaterial({
        color: 0x991b1b,
        roughness: 0.25,
        metalness: 0.15,
      });

      // Left Kidney
      const leftKidneyGeo = new THREE.SphereGeometry(0.26, 28, 28);
      leftKidneyGeo.scale(0.8, 1.35, 0.7);
      const leftKidney = new THREE.Mesh(leftKidneyGeo, kidneyMat);
      leftKidney.position.set(-0.38, 0.04, 0);
      leftKidney.rotation.z = -0.12;
      organGroup.add(leftKidney);

      // Right Kidney
      const rightKidneyGeo = new THREE.SphereGeometry(0.26, 28, 28);
      rightKidneyGeo.scale(0.8, 1.35, 0.7);
      const rightKidney = new THREE.Mesh(rightKidneyGeo, kidneyMat);
      rightKidney.position.set(0.38, 0, 0);
      rightKidney.rotation.z = 0.12;
      organGroup.add(rightKidney);

      // Central Vessels
      if (showVessels) {
        const aortaMat = new THREE.MeshStandardMaterial({ color: 0xd92d20, roughness: 0.3 });
        const venaCavaMat = new THREE.MeshStandardMaterial({ color: 0x2563eb, roughness: 0.3 });

        const aortaGeo = new THREE.CylinderGeometry(0.06, 0.05, 1.2, 16);
        const aortaMesh = new THREE.Mesh(aortaGeo, aortaMat);
        aortaMesh.position.set(0.07, 0, -0.03);
        organGroup.add(aortaMesh);

        const venaCavaGeo = new THREE.CylinderGeometry(0.07, 0.06, 1.2, 16);
        const venaCavaMesh = new THREE.Mesh(venaCavaGeo, venaCavaMat);
        venaCavaMesh.position.set(-0.07, 0, -0.03);
        organGroup.add(venaCavaMesh);

        // Branching Renal Arteries and Veins
        const branchGeo = new THREE.CylinderGeometry(0.03, 0.025, 0.38, 12);
        const leftRenalArtery = new THREE.Mesh(branchGeo, aortaMat);
        leftRenalArtery.position.set(-0.20, 0.04, 0);
        leftRenalArtery.rotation.z = Math.PI / 2;
        organGroup.add(leftRenalArtery);

        const rightRenalVein = new THREE.Mesh(branchGeo, venaCavaMat);
        rightRenalVein.position.set(0.20, 0, 0);
        rightRenalVein.rotation.z = Math.PI / 2;
        organGroup.add(rightRenalVein);
      }

      // Descending Ureters heading towards bladder
      const ureterMat = new THREE.MeshStandardMaterial({ color: 0xeab308, roughness: 0.4 });
      const ureterGeo = new THREE.CylinderGeometry(0.018, 0.015, 0.8, 10);
      const leftUreter = new THREE.Mesh(ureterGeo, ureterMat);
      leftUreter.position.set(-0.28, -0.45, 0);
      leftUreter.rotation.z = -0.15;
      organGroup.add(leftUreter);

      const rightUreter = new THREE.Mesh(ureterGeo, ureterMat);
      rightUreter.position.set(0.28, -0.45, 0);
      rightUreter.rotation.z = 0.15;
      organGroup.add(rightUreter);
    } else if (currentTarget.organKey === "heart") {
      // SITUATED INSIDE UPPER LEFT THORACIC MEDIASTINUM
      organGroup.position.set(-0.09, 0.44, 0.12);

      const heartMat = new THREE.MeshStandardMaterial({
        color: 0xba1a1a,
        roughness: 0.25,
        metalness: 0.1,
      });

      const heartGeo = new THREE.SphereGeometry(0.38, 30, 30);
      heartGeo.scale(0.9, 1.25, 0.85);
      const heartMesh = new THREE.Mesh(heartGeo, heartMat);
      heartMesh.position.set(0, -0.05, 0);
      heartMesh.rotation.z = -0.15;
      organGroup.add(heartMesh);

      if (showVessels) {
        // Aortic Arch curving up toward neck
        const aortaMat = new THREE.MeshStandardMaterial({ color: 0xd92d20, roughness: 0.3 });
        const archGeo = new THREE.TorusGeometry(0.22, 0.06, 16, 24, Math.PI * 0.85);
        const archMesh = new THREE.Mesh(archGeo, aortaMat);
        archMesh.position.set(0.06, 0.46, 0);
        archMesh.rotation.z = Math.PI * 0.1;
        organGroup.add(archMesh);

        // Superior Vena Cava
        const svcMat = new THREE.MeshStandardMaterial({ color: 0x2563eb, roughness: 0.3 });
        const svcGeo = new THREE.CylinderGeometry(0.055, 0.055, 0.5, 16);
        const svcMesh = new THREE.Mesh(svcGeo, svcMat);
        svcMesh.position.set(-0.18, 0.42, 0.04);
        organGroup.add(svcMesh);

        // LAD Coronary Artery across anterior wall
        const ladMat = new THREE.MeshBasicMaterial({ color: 0xff3b30 });
        const ladGeo = new THREE.CylinderGeometry(0.016, 0.012, 0.65, 10);
        const ladMesh = new THREE.Mesh(ladGeo, ladMat);
        ladMesh.position.set(0.08, -0.02, 0.30);
        ladMesh.rotation.z = 0.4;
        organGroup.add(ladMesh);
      }
    } else if (currentTarget.organKey === "pancreas") {
      // SITUATED HORIZONTALLY IN TRANSPYLORIC EPIGASTRIUM
      organGroup.position.set(0.04, 0.14, 0.06);

      const pancreasMat = new THREE.MeshStandardMaterial({
        color: 0xd97706,
        roughness: 0.4,
        metalness: 0.05,
      });

      const panGeo = new THREE.CylinderGeometry(0.12, 0.18, 0.9, 20);
      panGeo.scale(1, 1, 0.55);
      const panMesh = new THREE.Mesh(panGeo, pancreasMat);
      panMesh.position.set(0, 0, 0);
      panMesh.rotation.z = Math.PI * 0.45;
      organGroup.add(panMesh);

      // Duodenum C-Loop
      const duodMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.35 });
      const duodGeo = new THREE.TorusGeometry(0.26, 0.065, 16, 24, Math.PI * 1.3);
      const duodMesh = new THREE.Mesh(duodGeo, duodMat);
      duodMesh.position.set(-0.40, -0.04, 0);
      organGroup.add(duodMesh);
    } else if (currentTarget.organKey === "spine") {
      // SITUATED ALONG POSTERIOR DORSAL MIDLINE COLUMN
      organGroup.position.set(0, 0.08, -0.22);

      const boneMat = new THREE.MeshStandardMaterial({ color: 0xdfded8, roughness: 0.3, metalness: 0.1 });
      const discMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.5 });

      for (let i = 0; i < 5; i++) {
        // Lumbar Vertebrae L1 to L5
        const vertGeo = new THREE.CylinderGeometry(0.24, 0.26, 0.14, 20);
        const vertMesh = new THREE.Mesh(vertGeo, boneMat);
        vertMesh.position.set(0, -0.45 + i * 0.24, 0);
        organGroup.add(vertMesh);

        if (i < 4) {
          const discGeo = new THREE.CylinderGeometry(0.22, 0.22, 0.06, 18);
          const discMesh = new THREE.Mesh(discGeo, discMat);
          discMesh.position.set(0, -0.33 + i * 0.24, 0);
          organGroup.add(discMesh);
        }
      }
    } else {
      // VASCULAR / MICRO-CAPILLARY NETWORK ACROSS CENTRAL TRUNK
      organGroup.position.set(0, 0.18, 0.04);

      const vesselMat = new THREE.MeshStandardMaterial({ color: 0xd92d20, roughness: 0.25 });
      const rbcMat = new THREE.MeshStandardMaterial({ color: 0x991b1b, roughness: 0.2 });

      const trunkGeo = new THREE.CylinderGeometry(0.045, 0.04, 1.2, 16);
      const trunkMesh = new THREE.Mesh(trunkGeo, vesselMat);
      organGroup.add(trunkMesh);

      for (let i = 0; i < 6; i++) {
        const branchGeo = new THREE.CylinderGeometry(0.022, 0.015, 0.45, 12);
        const branchMesh = new THREE.Mesh(branchGeo, vesselMat);
        branchMesh.position.set(i % 2 === 0 ? 0.20 : -0.20, -0.3 + i * 0.15, 0);
        branchMesh.rotation.z = i % 2 === 0 ? 0.7 : -0.7;
        organGroup.add(branchMesh);

        const rbcGeo = new THREE.CylinderGeometry(0.038, 0.038, 0.015, 16);
        const rbcMesh = new THREE.Mesh(rbcGeo, rbcMat);
        rbcMesh.position.set(i % 2 === 0 ? 0.26 : -0.26, -0.3 + i * 0.15, 0.08);
        organGroup.add(rbcMesh);
      }
    }

    mainRig.add(organGroup);

    // =================================================================
    // 7. ACTIVE 3D PAIN POINT POINTER (PINPOINTING PAIN INSIDE BODY)
    // =================================================================
    const painGroup = new THREE.Group();
    const waveRings: THREE.Mesh[] = [];
    let arrowRig: THREE.Group | null = null;
    let internalCore: THREE.Mesh | null = null;

    if (showPainPointer && currentTarget.painCoords) {
      const coords = currentTarget.painCoords;
      const targetVec = new THREE.Vector3(coords.internal.x, coords.internal.y, coords.internal.z);
      const fromVec = new THREE.Vector3(coords.pointerFrom.x, coords.pointerFrom.y, coords.pointerFrom.z);
      const surfaceVec = new THREE.Vector3(coords.surface.x, coords.surface.y, coords.surface.z);

      // A. Directional Arrow Pointer aiming directly at the pain source
      arrowRig = new THREE.Group();
      const pointerMat = new THREE.MeshStandardMaterial({
        color: 0xff1744,
        emissive: 0xff1744,
        emissiveIntensity: 0.9,
        roughness: 0.2,
        metalness: 0.3,
      });

      // Arrowhead cone
      const coneGeo = new THREE.ConeGeometry(0.08, 0.22, 16);
      coneGeo.translate(0, 0.11, 0);
      const coneMesh = new THREE.Mesh(coneGeo, pointerMat);
      arrowRig.add(coneMesh);

      // Arrow shaft
      const shaftGeo = new THREE.CylinderGeometry(0.022, 0.022, 0.45, 12);
      shaftGeo.translate(0, -0.225, 0);
      const shaftMesh = new THREE.Mesh(shaftGeo, pointerMat);
      arrowRig.add(shaftMesh);

      // Position pointer at pointerFrom and orient tip directly towards targetVec
      arrowRig.position.copy(fromVec);
      const dir = new THREE.Vector3().subVectors(targetVec, fromVec).normalize();
      arrowRig.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
      painGroup.add(arrowRig);

      // B. Glowing Hotspot Core inside the internal organ
      const coreGeo = new THREE.SphereGeometry(0.08, 20, 20);
      const coreMat = new THREE.MeshBasicMaterial({ color: 0xff1744 });
      internalCore = new THREE.Mesh(coreGeo, coreMat);
      internalCore.position.copy(targetVec);
      painGroup.add(internalCore);

      // C. Concentric Radiating Pain Waves
      for (let i = 0; i < 3; i++) {
        const ringGeo = new THREE.RingGeometry(0.12 + i * 0.08, 0.16 + i * 0.08, 32);
        const ringMat = new THREE.MeshBasicMaterial({
          color: 0xff3b30,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.8 - i * 0.2,
        });
        const ringMesh = new THREE.Mesh(ringGeo, ringMat);
        ringMesh.position.copy(targetVec);
        ringMesh.lookAt(fromVec);
        painGroup.add(ringMesh);
        waveRings.push(ringMesh);
      }

      // D. Projection Laser Guide Line connecting outer body surface to internal organ
      const lineGeo = new THREE.BufferGeometry().setFromPoints([surfaceVec, targetVec]);
      const lineMat = new THREE.LineBasicMaterial({
        color: 0xff3b30,
        transparent: true,
        opacity: 0.75,
      });
      const guideLine = new THREE.Line(lineGeo, lineMat);
      painGroup.add(guideLine);

      // E. Outer Body Surface Hotspot Beacon
      const auraGeo = new THREE.RingGeometry(0.07, 0.13, 24);
      const auraMat = new THREE.MeshBasicMaterial({
        color: 0xff1744,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.7,
      });
      const surfaceAura = new THREE.Mesh(auraGeo, auraMat);
      surfaceAura.position.copy(surfaceVec);
      surfaceAura.lookAt(fromVec);
      painGroup.add(surfaceAura);

      mainRig.add(painGroup);
    }

    // =================================================================
    // 8. INTERACTIVE MOUSE ROTATION & ZOOM
    // =================================================================
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging || !mainRig) return;
      const deltaX = e.clientX - prevMouseX;
      const deltaY = e.clientY - prevMouseY;
      mainRig.rotation.y += deltaX * 0.008;
      mainRig.rotation.x += deltaY * 0.008;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      camera.position.z = Math.min(Math.max(camera.position.z + e.deltaY * 0.0025, 2.0), 6.5);
    };

    container.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    container.addEventListener("wheel", onWheel, { passive: false });

    // =================================================================
    // 9. ANIMATION LOOP
    // =================================================================
    let animId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // Continuous rotation if enabled
      if (autoRotate && !isDragging && mainRig) {
        mainRig.rotation.y += 0.006;
      }

      // Dynamic pain pointer bobbing / pointing oscillation
      if (arrowRig && currentTarget.painCoords) {
        const coords = currentTarget.painCoords;
        const targetVec = new THREE.Vector3(coords.internal.x, coords.internal.y, coords.internal.z);
        const fromVec = new THREE.Vector3(coords.pointerFrom.x, coords.pointerFrom.y, coords.pointerFrom.z);
        const dir = new THREE.Vector3().subVectors(targetVec, fromVec).normalize();
        const wobble = Math.sin(elapsed * 4) * 0.06;
        arrowRig.position.copy(fromVec).addScaledVector(dir, wobble);
      }

      // Radiating concentric pain waves
      waveRings.forEach((ring, index) => {
        const phase = (elapsed * 2 + index * 0.6) % 2;
        const scale = 0.8 + phase * 0.9;
        ring.scale.set(scale, scale, scale);
        (ring.material as THREE.MeshBasicMaterial).opacity = Math.max(0, (1 - phase / 2) * 0.8);
      });

      // Internal organ pain epicenter core pulse
      if (internalCore) {
        const pulse = 1 + 0.25 * Math.sin(elapsed * 6);
        internalCore.scale.set(pulse, pulse, pulse);
      }

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      const newW = container.clientWidth;
      const newH = container.clientHeight;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animId);
      container.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      container.removeEventListener("wheel", onWheel);
      window.removeEventListener("resize", handleResize);
      renderer.dispose();
    };
  }, [currentTarget, autoRotate, showVessels, showPainPointer, bodyMode]);

  return (
    <section className="page">
      <DemoPatient compact />

      <div className="page-heading">
        <span className="eyebrow">{t("3D Anatomy of Affected Area")}</span>
        <h2>{t("Diagnostic Pathology & Anatomical Systems")} ({activePatientName})</h2>
        <p>
          {t("3D anatomical visualization focuses exclusively on affected organs and physiological systems identified from your lab report anomalies.")}
        </p>
      </div>

      {activeTargets.length === 0 ? (
        <div className="card large" style={{ textAlign: "center", padding: "44px 20px", marginTop: 16 }}>
          <div style={{ fontSize: "2.8rem", marginBottom: 12 }}>🧬</div>
          <h3>{t("No affected anatomical areas detected in your medical diagnostic report")}</h3>
          <p style={{ color: "var(--text-muted, #64748b)", maxWidth: 540, margin: "0 auto 20px auto" }}>
            {t("3D anatomical visualization focuses exclusively on affected organs and physiological systems identified from your lab report anomalies. All tested biomarkers are currently normal, or no reports are uploaded yet.")}
          </p>
          <Link to="/upload" className="primary-button">
            + {t("Upload Medical Report")}
          </Link>
        </div>
      ) : (
        <>
          {/* Organ Selector Tabs (Affected Organs ONLY) */}
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 16 }}>
            {activeTargets.map((targ) => (
              <button
                key={targ.id}
                className={`secondary-button ${selectedTargetId === targ.id ? "active-filter-btn" : ""}`}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  backgroundColor: selectedTargetId === targ.id ? "#0ea5e9" : "#ffffff",
                  color: selectedTargetId === targ.id ? "#ffffff" : "#0f172a",
                  borderColor: selectedTargetId === targ.id ? "#0ea5e9" : "#cbd5e1",
                  fontWeight: 700,
                  fontSize: "0.85rem",
                  padding: "8px 14px",
                  borderRadius: "10px",
                }}
                onClick={() => setSelectedTargetId(targ.id)}
              >
                <span>⚠️</span>
                <span>{t(targ.anomalyName)}</span>
                <span
                  style={{
                    backgroundColor: selectedTargetId === targ.id ? "rgba(255,255,255,0.25)" : "#fee2e2",
                    color: selectedTargetId === targ.id ? "#ffffff" : "#b91c1c",
                    padding: "1px 6px",
                    borderRadius: "4px",
                    fontSize: "0.75rem",
                  }}
                >
                  {targ.patientValue}
                </span>
              </button>
            ))}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: 20 }}>
            {/* 3D Visualizer Canvas (AFFECTED ORGAN INSIDE TRANSLUCENT BODY) */}
            <div className="card" style={{ padding: 0, overflow: "hidden", position: "relative", minHeight: "560px", display: "flex", flexDirection: "column" }}>
              {/* Floating Top Left Organ Indicator */}
              <div
                style={{
                  position: "absolute",
                  top: 14,
                  left: 14,
                  zIndex: 10,
                  backgroundColor: "rgba(10, 14, 23, 0.85)",
                  padding: "8px 14px",
                  borderRadius: "10px",
                  border: "1px solid rgba(255, 255, 255, 0.15)",
                  backdropFilter: "blur(8px)",
                }}
              >
                <div style={{ color: "#38bdf8", fontSize: "0.72rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  🩺 {t("Affected Organ Inside Body")}
                </div>
                <div style={{ color: "#ffffff", fontWeight: 800, fontSize: "0.98rem" }}>
                  {t(currentTarget.affectedOrgan)}
                </div>
              </div>

              {/* Floating Top Right Controls */}
              <div
                style={{
                  position: "absolute",
                  top: 14,
                  right: 14,
                  zIndex: 10,
                  display: "flex",
                  gap: 6,
                  flexWrap: "wrap",
                  justifyContent: "flex-end",
                  maxWidth: "320px",
                }}
              >
                <button
                  type="button"
                  className="secondary-button"
                  style={{
                    fontSize: "0.72rem",
                    padding: "4px 8px",
                    backgroundColor: bodyMode === "glass" ? "#0284c7" : "rgba(10, 14, 23, 0.8)",
                    color: "#fff",
                    borderColor: "rgba(255,255,255,0.2)",
                  }}
                  onClick={() => setBodyMode(bodyMode === "glass" ? "wireframe" : bodyMode === "wireframe" ? "hidden" : "glass")}
                  title="Cycle between Translucent Glass Body, Wireframe, or Hide Body"
                >
                  👤 Body: {bodyMode === "glass" ? "Glass" : bodyMode === "wireframe" ? "Wire" : "Off"}
                </button>
                <button
                  type="button"
                  className="secondary-button"
                  style={{
                    fontSize: "0.72rem",
                    padding: "4px 8px",
                    backgroundColor: showPainPointer ? "#dc2626" : "rgba(10, 14, 23, 0.8)",
                    color: "#fff",
                    borderColor: "rgba(255,255,255,0.2)",
                  }}
                  onClick={() => setShowPainPointer(!showPainPointer)}
                  title="Toggle 3D Pain Pointer and Radiating Pain Waves"
                >
                  📍 {showPainPointer ? "Pain Pointer: ON" : "Pain Pointer: OFF"}
                </button>
                <button
                  type="button"
                  className="secondary-button"
                  style={{ fontSize: "0.72rem", padding: "4px 8px", backgroundColor: "rgba(10, 14, 23, 0.8)", color: "#fff", borderColor: "rgba(255,255,255,0.2)" }}
                  onClick={() => setAutoRotate(!autoRotate)}
                >
                  {autoRotate ? "⏸ Pause" : "▶ Rotate"}
                </button>
              </div>

              {/* Floating Bottom Left Pain Hotspot Pill */}
              {showPainPointer && (
                <div
                  style={{
                    position: "absolute",
                    bottom: 48,
                    left: 14,
                    right: 14,
                    zIndex: 10,
                    backgroundColor: "rgba(15, 23, 42, 0.88)",
                    padding: "8px 14px",
                    borderRadius: "8px",
                    border: "1px solid rgba(239, 68, 68, 0.4)",
                    backdropFilter: "blur(6px)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 12,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ display: "inline-block", width: 10, height: 10, borderRadius: "50%", backgroundColor: "#ef4444", boxShadow: "0 0 8px #ef4444" }} />
                    <span style={{ color: "#fee2e2", fontSize: "0.82rem", fontWeight: 700 }}>
                      📍 {t("Pain Point Inside Body")}: <span style={{ color: "#fca5a5" }}>{t(currentTarget.painTitle)}</span>
                    </span>
                  </div>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button
                      type="button"
                      onClick={() => setViewAngle("front")}
                      style={{ padding: "3px 8px", fontSize: "0.7rem", borderRadius: "5px", background: "#1e293b", color: "#e2e8f0", border: "1px solid #475569", cursor: "pointer" }}
                    >
                      Front View
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewAngle("back")}
                      style={{ padding: "3px 8px", fontSize: "0.7rem", borderRadius: "5px", background: "#1e293b", color: "#e2e8f0", border: "1px solid #475569", cursor: "pointer" }}
                    >
                      Flank / Back
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewAngle("organ")}
                      style={{ padding: "3px 8px", fontSize: "0.7rem", borderRadius: "5px", background: "#0284c7", color: "#ffffff", border: "1px solid #0ea5e9", cursor: "pointer" }}
                    >
                      Focus Organ
                    </button>
                  </div>
                </div>
              )}

              {/* ThreeJS Container */}
              <div
                ref={mountRef}
                style={{ width: "100%", height: "560px", cursor: "grab" }}
                title="Drag to rotate body, scroll wheel to zoom"
              />

              <div style={{ padding: "10px 16px", backgroundColor: "#0f172a", borderTop: "1px solid rgba(255,255,255,0.08)", fontSize: "0.78rem", color: "#94a3b8", display: "flex", justifyContent: "space-between" }}>
                <span>💡 {t("Drag mouse to rotate body 360° · Scroll wheel to zoom")}</span>
                <span>🔴 {t("Red 3D arrow points directly to internal pain point inside body")}</span>
              </div>
            </div>

            {/* Comprehensive Understanding Diagnostic Panel */}
            <div className="card" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <span className="card-label">{t("DIAGNOSTIC REPORT FINDING")}</span>
                <h3 style={{ margin: "4px 0", color: "#0f172a" }}>{t(currentTarget.anomalyName)}</h3>
                <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 4 }}>
                  <span className="badge" style={{ backgroundColor: "#fee2e2", color: "#b91c1c", fontWeight: 800 }}>
                    ⚠️ {currentTarget.patientValue} ({t(currentTarget.status)})
                  </span>
                  <span style={{ fontSize: "0.82rem", color: "var(--text-muted, #64748b)" }}>
                    {t(currentTarget.systemName)}
                  </span>
                </div>
              </div>

              {/* Highlighted Pain Point Breakdown */}
              <div style={{ backgroundColor: "rgba(239, 68, 68, 0.08)", padding: "12px 14px", borderRadius: 10, border: "1px solid rgba(239, 68, 68, 0.25)" }}>
                <strong style={{ fontSize: "0.88rem", color: "#b91c1c", display: "flex", alignItems: "center", gap: 6 }}>
                  📍 {t("Internal Pain Point & Clinical Zone")}:
                </strong>
                <div style={{ fontWeight: 700, color: "#991b1b", fontSize: "0.88rem", marginTop: 4 }}>
                  {t(currentTarget.painTitle)}
                </div>
                <p style={{ margin: "4px 0 0 0", fontSize: "0.84rem", color: "#7f1d1d", lineHeight: 1.4 }}>
                  {t(currentTarget.painZone)}
                </p>
              </div>

              <div style={{ borderTop: "1px dashed #e2e8f0", paddingTop: 10 }}>
                <strong style={{ fontSize: "0.85rem", color: "#0369a1" }}>🩺 {t("Affected Organ")}:</strong>
                <p style={{ margin: "4px 0", fontSize: "0.88rem", color: "#1e293b" }}>
                  {t(currentTarget.affectedOrgan)}
                </p>
              </div>

              <div>
                <strong style={{ fontSize: "0.85rem", color: "#0369a1" }}>🔬 {t("Affected Tissue")}:</strong>
                <p style={{ margin: "4px 0", fontSize: "0.86rem", color: "#475569" }}>
                  {t(currentTarget.affectedTissue)}
                </p>
              </div>

              <div>
                <strong style={{ fontSize: "0.85rem", color: "#0369a1" }}>🩸 {t("Vascular Pathway")}:</strong>
                <p style={{ margin: "4px 0", fontSize: "0.86rem", color: "#475569" }}>
                  {t(currentTarget.affectedVein)}
                </p>
              </div>

              <div>
                <strong style={{ fontSize: "0.85rem", color: "#0369a1" }}>🧬 {t("Biological Role")}:</strong>
                <p style={{ margin: "4px 0", fontSize: "0.86rem", color: "#475569" }}>
                  {t(currentTarget.biologicalRole)}
                </p>
              </div>

              <div style={{ backgroundColor: "rgba(241, 245, 249, 0.8)", padding: "10px 14px", borderRadius: 8, border: "1px solid #e2e8f0" }}>
                <strong style={{ fontSize: "0.85rem", color: "#334155" }}>⚠️ {t("Clinical Impact")}:</strong>
                <p style={{ margin: "4px 0", fontSize: "0.86rem", color: "#475569" }}>
                  {t(currentTarget.clinicalImpact)}
                </p>
              </div>

              <div style={{ marginTop: "auto", paddingTop: 8 }}>
                <Link
                  to={currentTarget.specialistLink}
                  className="primary-button"
                  style={{ display: "block", textAlign: "center", textDecoration: "none", width: "100%" }}
                >
                  🩺 {t(currentTarget.specialistTitle)} →
                </Link>
              </div>
            </div>
          </div>
        </>
      )}
    </section>
  );
}
