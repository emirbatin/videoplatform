export const platformOptions = [
    {
      id: "youtube",
      name: "YouTube",
      bgColor: "bg-red-500",
      placeholderText: "YouTube video URL'sini yapıştırın",
      helpText: "YouTube watch, short veya herhangi bir video URL'si yapıştırabilirsiniz."
    },
    {
      id: "GDrive",
      name: "GDrive",
      bgColor: "bg-green-500",
      placeholderText: "Google Drive paylaşım linkini yapıştırın",
      helpText: "Google Drive video linkini paylaşım formatında yapıştırın."
    },
    {
      id: "vimeo",
      name: "Vimeo",
      bgColor: "bg-blue-500",
      placeholderText: "Vimeo video URL'sini yapıştırın",
      helpText: "Vimeo video sayfasının URL'sini yapıştırın."
    },
    {
      id: "dailymotion",
      name: "DMotion",
      bgColor: "bg-indigo-500",
      placeholderText: "Dailymotion video URL'sini yapıştırın",
      helpText: "Dailymotion video sayfasının URL'sini yapıştırın."
    }
  ];
  
  export const qualityOptions = ["4K", "1080p", "720p", "480p", "360p"];
  
  export const initialFormData = {
    title: "",
    description: "",
    thumbnail: "",
    category: [],
    platforms: [{ id: "", name: "", url: "", quality: "1080p", bgColor: "" }],
    images: [{ url: "", thumbnail: "" }],
    downloadLinks: [{ title: "", quality: "", url: "" }],
  };
  
  // Helper functions
  export const generateId = (name) => name.toLowerCase().replace(/\s+/g, "-");
  
  // Form handling functions
  export const handleFormDataChange = (field, value, formData, setFormData) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };
  
  // Tag functions
  export const handleTagOperations = {
    add: (tagInput, formData, setFormData) => {
      if (tagInput.trim() && !formData.category.some(tag => tag.name === tagInput.trim())) {
        setFormData(prev => ({
          ...prev,
          category: [
            ...prev.category,
            { id: generateId(tagInput), name: tagInput.trim(), active: true }
          ]
        }));
        return true;
      }
      return false;
    },
    remove: (tag, formData, setFormData) => {
      setFormData(prev => ({
        ...prev,
        category: prev.category.filter(t => t.name !== tag.name)
      }));
    }
  };
  
  // Platform functions
  export const handlePlatformOperations = {
    change: (index, field, value, formData, setFormData) => {
      const newPlatforms = [...formData.platforms];
      
      if (field === "id") {
        const platform = platformOptions.find(p => p.id === value);
        newPlatforms[index] = {
          ...newPlatforms[index],
          id: platform.id,
          name: platform.name,
          bgColor: platform.bgColor
        };
      } else {
        newPlatforms[index][field] = value;
      }
      
      setFormData(prev => ({ ...prev, platforms: newPlatforms }));
    },
    add: (formData, setFormData) => {
      setFormData(prev => ({
        ...prev,
        platforms: [
          ...prev.platforms,
          { id: "", name: "", url: "", quality: "1080p", bgColor: "" }
        ]
      }));
    },
    remove: (index, formData, setFormData) => {
      setFormData(prev => ({
        ...prev,
        platforms: prev.platforms.filter((_, i) => i !== index)
      }));
    }
  };
  
  // Image functions
  export const handleImageOperations = {
    change: (index, value, formData, setFormData) => {
      const newImages = [...formData.images];
      newImages[index] = { ...newImages[index], url: value, thumbnail: value };
      setFormData(prev => ({ ...prev, images: newImages }));
    },
    add: (formData, setFormData) => {
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, { url: "", thumbnail: "" }]
      }));
    },
    remove: (index, formData, setFormData) => {
      setFormData(prev => ({
        ...prev,
        images: prev.images.filter((_, i) => i !== index)
      }));
    }
  };
  
  // Download link functions
  export const handleDownloadLinkOperations = {
    change: (index, field, value, formData, setFormData) => {
      const newLinks = [...formData.downloadLinks];
      newLinks[index][field] = value;
      setFormData(prev => ({ ...prev, downloadLinks: newLinks }));
    },
    add: (formData, setFormData) => {
      setFormData(prev => ({
        ...prev,
        downloadLinks: [...prev.downloadLinks, { title: "", quality: "", url: "" }]
      }));
    },
    remove: (index, formData, setFormData) => {
      setFormData(prev => ({
        ...prev,
        downloadLinks: prev.downloadLinks.filter((_, i) => i !== index)
      }));
    }
  };
  
  // Data preparation
  export const prepareVideoData = (formData) => {
    const cleanedPlatforms = formData.platforms.filter(p => p.url && p.id);
    const cleanedImages = formData.images.filter(img => img.url);
    const cleanedDownloadLinks = formData.downloadLinks.filter(
      link => link.url && link.title
    );
  
    return {
      title: formData.title.trim(),
      description: formData.description.trim() || null,
      thumbnail: formData.thumbnail.trim(),
      category: formData.category.length > 0 ? formData.category : [],
      platforms: cleanedPlatforms.length > 0 ? cleanedPlatforms : [],
      images: cleanedImages.length > 0 ? cleanedImages : [],
      downloadLinks: cleanedDownloadLinks.length > 0 ? cleanedDownloadLinks : []
    };
  };