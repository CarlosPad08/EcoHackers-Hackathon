// document.getElementById('nodeSelector').addEventListener('change', function() {
//     var selectedNode = this.value;
//     var nodeImage = document.getElementById('nodeImage');
//     nodeImage.src = './imagenes/' + selectedNode + '.jfif'; // Cambia la extensión si es necesario
//   });

document.getElementById('nodeSelector').addEventListener('change', function() {
    var selectedNode = this.value;
    var nodeImage = document.getElementById('nodeImage');
    var placeholderText = document.getElementById('placeholderText');
    
    if (selectedNode) {
      nodeImage.src = './imagenes/' + selectedNode + '.jfif'; // Cambia la extensión si es necesario
      nodeImage.classList.remove('d-none');
      placeholderText.classList.add('d-none');
    } else {
      nodeImage.src = '';
      nodeImage.classList.add('d-none');
      placeholderText.classList.remove('d-none');
    }
  });