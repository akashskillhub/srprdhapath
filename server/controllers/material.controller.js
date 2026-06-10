const Material = require('../model/Material');
const path = require('path');
const fs = require('fs');

exports.createMaterial = async (req, res) => {
  try {
    const { title, content, type, subjectId, fileUrl: bodyFileUrl } = req.body;
    let fileUrl = bodyFileUrl || '';

    if (req.file) {
      fileUrl = `/uploads/${req.file.filename}`;
    }

    const material = new Material({
      title,
      content,
      fileUrl,
      type,
      subjectId
    });

    await material.save();
    res.status(201).json({ success: true, data: material });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getMaterialsBySubject = async (req, res) => {
  try {
    const { subjectId } = req.params;
    const materials = await Material.find({ subjectId }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: materials });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteMaterial = async (req, res) => {
  try {
    const material = await Material.findById(req.params.id);
    if (!material) return res.status(404).json({ success: false, message: 'Material not found' });

    // Delete file if exists
    if (material.fileUrl && material.fileUrl.startsWith('/uploads/')) {
      const filePath = path.join(__dirname, '..', material.fileUrl);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await material.deleteOne();
    res.status(200).json({ success: true, message: 'Material deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateMaterial = async (req, res) => {
    try {
        const { title, content, type, fileUrl: bodyFileUrl } = req.body;
        const material = await Material.findById(req.params.id);
        if (!material) return res.status(404).json({ success: false, message: 'Material not found' });

        material.title = title || material.title;
        material.content = content || material.content;
        material.type = type || material.type;

        if (req.file) {
            // Delete old file
            if (material.fileUrl && material.fileUrl.startsWith('/uploads/')) {
                const oldPath = path.join(__dirname, '..', material.fileUrl);
                if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
            }
            material.fileUrl = `/uploads/${req.file.filename}`;
        } else if (bodyFileUrl !== undefined) {
            material.fileUrl = bodyFileUrl;
        }

        await material.save();
        res.status(200).json({ success: true, data: material });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
