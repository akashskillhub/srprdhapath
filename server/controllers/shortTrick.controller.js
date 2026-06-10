const ShortTrick = require('../model/ShortTrick');

exports.createShortTrick = async (req, res) => {
  try {
    const { title, content, subjectId } = req.body;
    let image = null;

    if (req.file) {
      image = `/uploads/${req.file.filename}`;
    }

    const shortTrick = new ShortTrick({
      title,
      content,
      subjectId,
      image
    });

    await shortTrick.save();
    res.status(201).json(shortTrick);
  } catch (err) {
    res.status(500).json({ message: 'Error creating short trick', error: err.message });
  }
};

exports.getShortTricksBySubject = async (req, res) => {
  try {
    const { subjectId } = req.params;
    const shortTricks = await ShortTrick.find({ subjectId }).sort({ createdAt: -1 });
    res.json(shortTricks);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching short tricks', error: err.message });
  }
};

exports.updateShortTrick = async (req, res) => {
  try {
    const { title, content, subjectId } = req.body;
    let updateData = { title, content, subjectId };

    if (req.file) {
      updateData.image = `/uploads/${req.file.filename}`;
    }

    const shortTrick = await ShortTrick.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!shortTrick) return res.status(404).json({ message: 'Short trick not found' });
    res.json(shortTrick);
  } catch (err) {
    res.status(500).json({ message: 'Error updating short trick', error: err.message });
  }
};

exports.deleteShortTrick = async (req, res) => {
  try {
    const shortTrick = await ShortTrick.findByIdAndDelete(req.params.id);
    if (!shortTrick) return res.status(404).json({ message: 'Short trick not found' });
    res.json({ message: 'Short trick deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting short trick', error: err.message });
  }
};
