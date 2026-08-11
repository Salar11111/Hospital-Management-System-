function statusTone(status) {
  const key = status.toLowerCase();
  if (key === 'completed' || key === 'confirmed' || key === 'dispensed' || key === 'active')
    return 'green';
  if (key === 'cancelled' || key === 'no-show' || key === 'deactivated') return 'red';
  if (key === 'pending') return 'amber';
  if (key === 'admin') return 'violet';
  return 'gray';
}
export { statusTone };
