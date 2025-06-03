## Sistema de Monitoramento Ambiental em Tempo Real
# Arquitetura Baseada em Eventos com IoT

**📘 Proposta da Aplicação** 

▪ Criar um sistema para monitorar dados ambientais como qualidade do ar, temperatura, umidade, poluição sonora, risco de tempestade.

▪ Esses dados serão provenientes de **sensores distribuídos** que publicam os eventos constantemente. Para simplificar, simule o funcionamento dos sensores (dados fixos manuais, ou dados aleatórios).

▪ Cada leitura de um sensor é considerado um evento, que pode ser consumido por diferente serviços, como:

        • Alerta em tempo real de possível risco, para autoridades ou moradores;

        • Painel/mosaico de visualização dos dados em tempo real;

        • Armazenamento para análise histórica;

▪ O **objetivo** é mostrar como fluxos de dados em tempo real podem ser tratados com eficiência. E como sistemas reativos baseados em eventos contribuem com escalabilidade e a modularidade.

▪ A aplicação para simular os sensores (publish) deve ser separada da aplicação dos serviços (subscribe). A comunicação pode utilizar um Message Broker para os eventos (RabbitMQ, por exemplo).

<br>

**👥 Time** 

- [Andressa Oliveira](https://github.com/andressa-oliveira21051) - CEFET/RJ
- [Carlos Ishiro](https://github.com/carlosifsm) - CEFET/RJ
- [Erich Johann](https://github.com/ErichJohann) - CEFET/RJ
- [Erick Andrade](https://github.com/erick1-618) - CEFET/RJ
- [Gustavo Andrade](https://github.com/GustavoAndrad) - CEFET/RJ
- [Sarah Campos](https://github.com/sarahscampos) - CEFET/RJ
