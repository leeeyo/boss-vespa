'use client'

import { useRef, useEffect, useMemo } from 'react'
import { useGLTF, useTexture } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

type VespaModelProps = {
  color: string
  autoRotate?: boolean
  onLoad?: () => void
}

export function VespaModel({ color, autoRotate = false, onLoad }: VespaModelProps) {
  const group = useRef<THREE.Group>(null)
  const { scene } = useGLTF('/models/vespa_primavera_sprint-4k.glb') // Using 4K texture version
  
  // Load tire texture
  const tireNormal = useTexture('/textures/rubber_tires_normal.png')
  
  // Store materials for smooth color transitions
  const bodyMaterialsRef = useRef<THREE.MeshStandardMaterial[]>([])
  const targetColorRef = useRef(new THREE.Color(color))
  
  // Clone the scene once and memoize it
  const clonedScene = useMemo(() => {
    const cloned = scene.clone()
    // Call onLoad after scene is cloned and ready
    if (onLoad) {
      setTimeout(() => onLoad(), 100)
    }
    return cloned
  }, [scene, onLoad])

  // Auto-rotate animation + smooth color transitions
  useFrame((state, delta) => {
    if (autoRotate && group.current) {
      group.current.rotation.y += delta * 0.3
    }
    
    // Smoothly transition body colors
    bodyMaterialsRef.current.forEach((material) => {
      if (material.color) {
        material.color.lerp(targetColorRef.current, delta * 6) // Smooth color transition
      }
    })
  })

  // Update target color when prop changes
  useEffect(() => {
    targetColorRef.current.set(color)
  }, [color])

  // Setup materials, textures, and shadows (runs once)
  useEffect(() => {
    if (!clonedScene) return

    const bodyMaterials: THREE.MeshStandardMaterial[] = []

    clonedScene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        const mesh = child as THREE.Mesh
        const meshName = mesh.name.toLowerCase()
        const materialName = mesh.material ? 
          (Array.isArray(mesh.material) ? mesh.material[0]?.name : mesh.material.name)?.toLowerCase() || '' 
          : ''
        
        // Check if this is a tire/wheel component (should NOT be colored)
        const isTire = 
          meshName.includes('tire') || 
          meshName.includes('wheel') || 
          meshName.includes('rubber') ||
          materialName.includes('tire') ||
          materialName.includes('wheel') ||
          materialName.includes('rubber')
        
        // Check if this is a seat/chair component (should NOT be colored)
        const isSeat = 
          meshName.includes('seat') || 
          meshName.includes('chair') || 
          meshName.includes('saddle') ||
          meshName.includes('cushion') ||
          materialName.includes('seat') ||
          materialName.includes('chair') ||
          materialName.includes('saddle') ||
          materialName.includes('leather')
        
        if (mesh.material) {
          if (Array.isArray(mesh.material)) {
            mesh.material.forEach((mat) => {
              if (mat instanceof THREE.MeshStandardMaterial || 
                  mat instanceof THREE.MeshPhysicalMaterial) {
                
                const matName = mat.name.toLowerCase()
                const isTireMat = matName.includes('tire') || matName.includes('wheel') || matName.includes('rubber')
                const isSeatMat = matName.includes('seat') || matName.includes('chair') || matName.includes('saddle') || matName.includes('leather')
                
                if (isTireMat) {
                  // Apply tire texture
                  mat.normalMap = tireNormal
                  mat.color = new THREE.Color('#1a1a1a')
                  mat.roughness = 0.9
                  mat.metalness = 0
                } else if (isSeatMat) {
                  // Keep seat original color/material
                  // Don't add to bodyMaterials, don't change color
                } else if (matName.includes('paint') || 
                           matName.includes('body') ||
                           matName.includes('color')) {
                  // Store body materials for smooth color transitions
                  bodyMaterials.push(mat)
                  mat.color = new THREE.Color(color)
                }
              }
            })
          } else {
            const material = mesh.material
            
            if (material instanceof THREE.MeshStandardMaterial || 
                material instanceof THREE.MeshPhysicalMaterial) {
              
              const matName = material.name.toLowerCase()
              const isTireMat = matName.includes('tire') || matName.includes('wheel') || matName.includes('rubber')
              const isSeatMat = matName.includes('seat') || matName.includes('chair') || matName.includes('saddle') || matName.includes('leather')
              
              if (isTire || isTireMat) {
                // Apply tire texture and keep dark
                material.normalMap = tireNormal
                material.color = new THREE.Color('#1a1a1a')
                material.roughness = 0.9
                material.metalness = 0
              } else if (isSeat || isSeatMat) {
                // Keep seat original color/material
                // Don't add to bodyMaterials, don't change color
              } else {
                // Only apply color to non-metallic body parts
                const isBodyPart = 
                  matName.includes('paint') || 
                  matName.includes('body') ||
                  matName.includes('color') ||
                  (material instanceof THREE.MeshStandardMaterial && material.metalness < 0.5)
                
                if (isBodyPart) {
                  bodyMaterials.push(material)
                  material.color = new THREE.Color(color)
                }
              }
            }
          }
        }
        
        // Optimize shadows - only cast on important parts
        if (!isTire && !isSeat && !meshName.includes('small')) {
          mesh.castShadow = true
        }
        mesh.receiveShadow = true
      }
    })

    // Store body materials for smooth transitions
    bodyMaterialsRef.current = bodyMaterials
  }, [clonedScene, tireNormal, color])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Clean up materials
      bodyMaterialsRef.current.forEach((material) => {
        material.dispose()
      })
      bodyMaterialsRef.current = []
    }
  }, [])

  return (
    <group ref={group}>
      <primitive object={clonedScene} scale={1.5} position={[0, -0.5, 0]} />
    </group>
  )
}

// Preload assets (4K version)
useGLTF.preload('/models/vespa_primavera_sprint-4k.glb')
useTexture.preload('/textures/rubber_tires_normal.png')

