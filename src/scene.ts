import {
  Color,
  CylinderGeometry,
  DoubleSide,
  EdgesGeometry,
  Group,
  MathUtils,
  Mesh,
  MeshBasicMaterial,
  PerspectiveCamera,
  Scene,
} from "three"
import degToRad = MathUtils.degToRad
import { LineSegmentsGeometry } from "three/examples/jsm/lines/LineSegmentsGeometry"
import { LineSegments2 } from "three/examples/jsm/lines/LineSegments2"
import { LineMaterial } from "three/examples/jsm/lines/LineMaterial"

export const WIDTH = window.innerWidth - 20
export const HEIGHT = window.innerHeight - 20

export const MAX_CYLINDER_COUNT = 100
export const cylinderScale = 0.5
const opaqueColor = 0x000010
const opaqueShapeDownScale = 0.9899
const lineColor = 0x04d9ff
export const carpetLength = 10

export const lineMaterial = new LineMaterial({
  color: lineColor,
  linewidth: 2,
  side: DoubleSide,
})

function createCylinder(segments: number) {
  const radius = 0.5 / Math.sin(Math.PI / segments)
  const cylinder = new CylinderGeometry(radius, radius, cylinderScale, segments)
  const edges = new EdgesGeometry(cylinder)
  const lineGeometry = new LineSegmentsGeometry()

  // inner
  const opaqueMaterial = new MeshBasicMaterial({ color: opaqueColor })
  const opaqueInner = new Mesh(cylinder, opaqueMaterial)

  opaqueInner.scale.set(opaqueShapeDownScale, opaqueShapeDownScale, opaqueShapeDownScale)

  lineMaterial.resolution.set(WIDTH, HEIGHT)
  const mesh = new LineSegments2(lineGeometry.fromEdgesGeometry(edges), lineMaterial)
  mesh.position.set(0, radius, 0)
  mesh.rotation.set(degToRad(90), degToRad(0), degToRad(0))

  mesh.add(opaqueInner)

  return mesh
}

function createCarpet() {
  const group = new Group()
  const carpet = createCylinder(2)
  carpet.rotation.set(degToRad(90), degToRad(90), 0)
  carpet.position.set(-0.5, 0, 0)

  Array.from({ length: carpetLength }, (_, i) => {
    const piece = carpet.clone()
    piece.position.set(-0.5 - i, 0, 0)
    group.add(piece)
  })

  return group
}

const subjects = Array.from({ length: MAX_CYLINDER_COUNT }, (_, i) => {
  const segments = i + 2

  return {
    mesh: createCylinder(segments),
    segments,
  }
})

export const scene = new Scene()
scene.background = new Color("black")

export const cylinders = subjects.map(({ mesh, segments }, i) => {
  const redressAnchor = new Group()
  const angleSum = (segments - 2) * 180

  const redressAngle = 90 - angleSum / segments / 2
  redressAnchor.rotation.z += degToRad(-redressAngle)
  redressAnchor.add(mesh)

  const adjustXAnchor = new Group()
  adjustXAnchor.position.x = -1
  adjustXAnchor.add(redressAnchor)

  const rotationAnchor = new Group()
  rotationAnchor.add(adjustXAnchor)

  const mirrorAnchor = rotationAnchor.clone()

  mirrorAnchor.position.x = -carpetLength
  mirrorAnchor.scale.y = -1

  const translationAnchor = new Group()
  translationAnchor.add(rotationAnchor)
  translationAnchor.add(mirrorAnchor)

  const carpet = createCarpet()
  translationAnchor.add(carpet)

  translationAnchor.position.z = i * 0.5123
  return {
    segments,
    mesh,
    carpet,
    translationAnchor,
    rotationAnchor,
    mirrorAnchor,
  }
})

export const camera = new PerspectiveCamera(25, WIDTH / HEIGHT, 0.01, 2000)
camera.position.set(-8.756226251732606, 4.905647329951018, -1.9621035080592346)
