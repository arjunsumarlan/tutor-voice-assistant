import type { Prompt } from "comfy-ui-client";

export const prompt: Prompt = {
  "33": {
    class_type: "CLIPTextEncode",
    inputs: {
      clip: null, // This is set to null as there's no link provided in the JSON
      text: "", // This corresponds to the empty text in widgets_values
    },
  },
  "40": {
    class_type: "CLIPTextEncode",
    inputs: {
      clip: ["39", 0], // Links to DualCLIPLoader's output
      text: "", // Corresponds to widgets_values
    },
  },
  "41": {
    class_type: "VAELoader",
    inputs: {
      vae_name: "ae.safetensors", // Corresponds to widgets_values
    },
  },
  "8": {
    class_type: "VAEDecode",
    inputs: {
      samples: ["31", 0], // Link to KSampler's output (LATENT)
      vae: ["41", 0], // Link to VAELoader's output (VAE)
    },
  },
  "27": {
    class_type: "EmptySD3LatentImage",
    inputs: {
      batch_size: 1,
      height: 768,
      width: 1024,
    },
  },
  "31": {
    class_type: "KSampler",
    inputs: {
      seed: 600,
      control_after_generate: "fixed",
      steps: 18,
      cfg: 1.0,
      sampler_name: "euler",
      scheduler: "normal",
      denoise: 1,
      latent_image: ["27", 0], // Link to EmptySD3LatentImage's output
      model: ["37", 0], // Link to Reroute's output (UnetLoaderGGUF)
      positive: ["35", 0], // Link to FluxGuidance's output
      negative: ["40", 0], // Link to CLIPTextEncode's output
    },
  },
  "9": {
    class_type: "SaveImage",
    inputs: {
      filename_prefix: "ComfyUI", // Corresponds to widgets_values
      images: ["8", 0], // Link to VAEDecode's output
    },
  },
  "6": {
    class_type: "CLIPTextEncode",
    inputs: {
      clip: ["39", 0], // Link to DualCLIPLoader's output
      text: "black broken line circle with white background", // Corresponds to widgets_values
    },
  },
  "37": {
    class_type: "UnetLoaderGGUF",
    inputs: {
      unet_name: "flux1-dev-Q4_K_S.gguf", // Corresponds to widgets_values
    },
  },
  "39": {
    class_type: "DualCLIPLoader",
    inputs: {
      clip_name1: "t5xxl_fp8_e4m3fn.safetensors", // Corresponds to widgets_values
      clip_name2: "clip_l.safetensors", // Corresponds to widgets_values
      type: "flux", // Corresponds to widgets_values
    },
  },
  "35": {
    class_type: "FluxGuidance",
    inputs: {
      conditioning: ["6", 0], // Link to CLIPTextEncode's output
      guidance: 3.5, // Corresponds to widgets_values
    },
  },
};
