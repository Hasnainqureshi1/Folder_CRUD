app.post('/items', async (req, res) => {
 const { name, path, type, file_type, parent_id, owner_id, department_id } = req.body;

 try {
   const [result] = await pool.execute(
     'INSERT INTO items (name, path, type, file_type, parent_id, owner_id, department_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
     [name, path, type, type === 'file' ? file_type : null, parent_id, owner_id, department_id]
   );

   res.status(201).json({ message: 'Item created', id: result.insertId });
 } catch (error) {
   console.error(error);
   res.status(500).send('Server error');
 }
});
app.get('/items/:parentId?', async (req, res) => {
 const { parentId } = req.params;

 try {
   const [items] = await pool.query(
     'SELECT * FROM items WHERE parent_id = ?',
     [parentId || null]
   );

   res.json(items);
 } catch (error) {
   console.error(error);
   res.status(500).send('Server error');
 }
});
app.patch('/items/:id', async (req, res) => {
 const { id } = req.params;
 const { name, path, file_type, parent_id, owner_id, department_id } = req.body;

 try {
   await pool.execute(
     'UPDATE items SET name = ?, path = ?, file_type = ?, parent_id = ?, owner_id = ?, department_id = ? WHERE id = ?',
     [name, path, file_type, parent_id, owner_id, department_id, id]
   );

   res.json({ message: 'Item updated' });
 } catch (error) {
   console.error(error);
   res.status(500).send('Server error');
 }
});
app.delete('/items/:id', async (req, res) => {
 const { id } = req.params;

 try {
   await pool.execute('DELETE FROM items WHERE id = ?', [id]);

   res.json({ message: 'Item deleted' });
 } catch (error) {
   console.error(error);
   res.status(500).send('Server error');
 }
});
